# Knipserl Fotobox – Admin Dashboard Konzept

## Überblick

Admin Dashboard für die vollständige Verwaltung der Knipserl Fotobox – von der Kundenanfrage über die Auftragsverwaltung und Fahrer-Koordination bis hin zur Buchhaltung mit Bankabgleich. Ersetzt das bisherige System aus Google Sheets, AppSheet, Zapier und Gravity Forms durch eine integrierte Lösung.

### Zwei Firmierungen
- **Knipserl Fotobox / Andreas Huber** (Einzelunternehmen) → Privatkunden
- **Andreas und Julia Huber Knipserl GbR** → Firmenkunden

Beide Unternehmen sind Kleinunternehmer gemäß §19 UStG (keine MwSt.).

---

## Tech Stack

| Bereich | Technologie |
|---------|------------|
| Frontend/Backend | Next.js 15 (App Router), TypeScript |
| Datenbank | PostgreSQL mit Prisma ORM |
| Auth | NextAuth.js mit rollenbasiertem Zugang |
| UI | Tailwind CSS + shadcn/ui + Tabler Icons |
| Charts | shadcn/ui Charts (basierend auf Recharts) |
| Bank | FinTS/HBCI via `nodejs-fints` (kostenlos, Open Source) |
| KI | OpenAI API für Eingangsrechnungs-Erkennung (OCR + Extraktion) |
| E-Mail | Nodemailer / Resend für transaktionale Mails |
| PDF | `@react-pdf/renderer` für Rechnungen/Angebote |
| Kalender | FullCalendar React |
| Deployment | Docker + Docker Compose auf Hetzner Server |
| CI/CD | GitHub Actions → Deploy auf Hetzner |

---

## Rollen & Zugänge

| Rolle | Beschreibung | BAR-Aufträge sichtbar |
|-------|-------------|----------------------|
| **Admin** | Vollzugriff auf alle Funktionen | ✅ Ja |
| **Admin Buchhaltung** | Alle Funktionen außer BAR-Aufträge | ❌ Nein |
| **Fahrer** | Eigene Fahrten, offene Aufträge annehmen, Urlaub, Auftragsdetails | Nur zugewiesene |

---

## Datenmodell

### User
- id, name, email, passwordHash, role (ADMIN | ADMIN_ACCOUNTING | DRIVER), phone, createdAt
- Fahrer-Zusatzfelder: vehiclePlate, maxDistanceKm

### Company (Firma)
- id, name, address, taxNumber, bankDetails, invoicePrefix, invoiceNumberCurrent, invoiceTemplate, isKleinunternehmer (immer true)

### Inquiry (Anfrage)
- id, customerName, customerEmail, customerPhone, eventDate, eventType, locationName, locationAddress, locationLat, locationLng, distanceKm, extras[], comments, status (NEW | ACCEPTED | REJECTED), createdAt

### Order (Auftrag)
- id, inquiryId, companyId (auto: Firma→GbR, Privat→Einzelunternehmen), driverId, paymentMethod (INVOICE | CASH), status (OPEN | ASSIGNED | COMPLETED | CANCELLED), price, extras[], notes, completedAt

### Vacation (Urlaub)
- id, driverId, startDate, endDate, note

### Quote (Angebot)
- id, orderId, companyId, quoteNumber, items[], totalAmount, status (DRAFT | SENT | ACCEPTED | REJECTED), validUntil, pdfUrl

### Invoice (Ausgangsrechnung)
- id, orderId, companyId, invoiceNumber, items[], totalAmount, status (DRAFT | SENT | PAID | OVERDUE | CANCELLED), dueDate, paidAt, pdfUrl

### IncomingInvoice (Eingangsrechnung)
- id, companyId, vendor, invoiceNumber, amount, dueDate, status (PENDING | PAID | OVERDUE), category, pdfUrl, ocrData (JSON), bankTransactionId

### BankTransaction (Banktransaktion)
- id, companyId, date, amount, reference, counterpartName, counterpartIban, matchedInvoiceId, matchedIncomingInvoiceId, isReconciled

### BankConnection (Bankverbindung)
- id, companyId, bankUrl, bankCode, username, encryptedPin, lastSync

---

## Module & Features

### 1. Dashboard (Startseite)
- **KPI-Karten:** Neue Anfragen, offene Aufträge, Umsatz aktueller Monat, offene Rechnungen
- **Nächste Aufträge:** Die nächsten 5 anstehenden Aufträge
- **Quick-Actions:** Anfrage annehmen, Rechnung erstellen
- **Warnungen:** Überfällige Rechnungen, unzugeordnete Banktransaktionen

### 2. Anfrage-Management
- **API-Endpoint** für Webseite-Formular (ersetzt Gravity Forms → Google Sheets)
- **Listenansicht** aller Anfragen mit Filter und Suche
- **Detailansicht** mit allen Formularfeldern
- **Annehmen** → Automatisch Auftrag erstellen + Bestätigungsmail an Kunden
- **Ablehnen** → Absage-Mail an Kunden
- **Adressvalidierung + KM-Berechnung** (Google Maps API oder OpenRouteService)

### 3. Auftrags-Management
- **Listenansicht** mit Filtern: Status, Datum, Fahrer, Zahlart
- **Detailansicht:** Alle Infos, Fahrer-Zuweisung, Kommentare, Extras, Verlauf
- **Automatische Firmenzuordnung:** Firmenkunde → GbR, Privatkunde → Einzelunternehmen
- **BAR-Aufträge:** Nur sichtbar für Admin (Vollzugriff), komplett ausgeblendet für Admin Buchhaltung
- **Status-Workflow:** OPEN → ASSIGNED → COMPLETED

### 4. Fahrer-Portal
- **Eigenes Dashboard** mit zugewiesenen Fahrten
- **Offene Aufträge** zum Selbst-Zuweisen ("Auftrag schnappen")
- **Auftragsdetails:** Adresse, Datum/Uhrzeit, Extras, Kommentare, Anfahrtslink (Google Maps)
- **Urlaubsverwaltung:** Zeiträume eintragen und löschen
- **Mobile-optimiert** (Fahrer nutzen primär Smartphone)

### 5. Kalender
- **Monatsansicht** mit allen Aufträgen (farbcodiert nach Status)
- **Fahrer-Urlaube** eingeblendet
- **Engpass-Warnung** wenn alle Fahrer im Urlaub
- **Tages-/Wochenansicht**
- **Drag & Drop** für Fahrer-Zuweisung

### 6. Buchhaltung

#### 6a. Angebote
- Erstellen aus Auftrag heraus
- Automatischer Nummernkreis pro Firma (z.B. `EU-2026-001`, `GBR-2026-001`)
- Kleinunternehmer-Hinweis auf allen Dokumenten (§19 UStG)
- PDF-Generierung mit firmenspezifischem Template
- Per E-Mail versenden
- Status-Tracking (Entwurf → Versendet → Angenommen / Abgelehnt)

#### 6b. Ausgangsrechnungen
- Erstellen aus Auftrag oder Angebot heraus
- **Nur für Aufträge mit Zahlart RECHNUNG** (nicht BAR)
- Eigener Nummernkreis pro Firma
- PDF mit firmenspezifischem Template + Kleinunternehmer-Hinweis
- Zahlungserinnerungen (manuell und automatisch)
- Status: Entwurf → Versendet → Bezahlt / Überfällig

#### 6c. Eingangsrechnungen
- **PDF-Upload mit KI-Erkennung** (OCR via OpenAI Vision API)
- Automatische Extraktion: Lieferant, Betrag, Rechnungsnummer, Datum, Fälligkeit
- Manuelle Korrektur/Bestätigung der KI-Ergebnisse
- Kategorisierung (Fahrtkosten, Equipment, Marketing, Versicherung, etc.)
- Zuordnung zu Firma (Einzelunternehmen oder GbR)

#### 6d. Bankabgleich (Sparkasse)
- **FinTS/HBCI-Anbindung** für automatischen Kontoauszug-Abruf
- Pro Firma eigene Bankverbindung
- **Automatisches Matching:** Banktransaktionen ↔ Ausgangsrechnungen (über Verwendungszweck/Betrag)
- **Dashboard:** Gematchte, ungematchte Transaktionen, offene Eingangsrechnungen
- Manuelles Zuordnen bei fehlgeschlagenem Auto-Match
- Automatische Markierung bezahlter Rechnungen

### 7. Statistiken & Metriken

#### Finanzen
- Umsatz pro Monat / Quartal / Jahr (Gesamt + pro Firma)
- Offene vs. bezahlte Rechnungen
- Durchschnittlicher Auftragswert
- Zahlungsmoral (durchschnittliche Tage bis Zahlung)
- Ausgaben nach Kategorie
- Gewinn/Verlust-Übersicht

#### Aufträge
- Anfragen vs. angenommene Aufträge (Conversion Rate)
- Aufträge pro Monat (saisonale Trends)
- Beliebte Eventarten (Hochzeit, Geburtstag, Firmenfeier, etc.)
- Durchschnittliche Entfernung in KM
- Extras-Häufigkeit (welche Extras werden am meisten gebucht)

#### Fahrer
- Aufträge pro Fahrer
- Gefahrene KM pro Fahrer
- Auslastungsquote
- Verfügbarkeit vs. Urlaub

#### Allgemein
- Vergleich Einzelunternehmen vs. GbR
- Year-over-Year Vergleiche
- Exportfunktion (CSV / PDF)

### 8. E-Mail-System
- **Templates für:** Anfrage-Bestätigung, Auftrag angenommen, Auftrag abgelehnt, Angebot, Rechnung, Zahlungserinnerung
- **Templates pro Firma** (unterschiedliches Branding/Absender)
- **E-Mail-Log** (wann wurde was an wen gesendet)

### 9. Einstellungen
- Firmenverwaltung (2 Firmen mit jeweiligen Stammdaten)
- Nummernkreise verwalten
- Rechnungs-/Angebotstemplates anpassen
- Benutzerverwaltung (Admins + Fahrer)
- Bankverbindungen konfigurieren
- Standard-Texte für E-Mails
- Extras-Katalog verwalten (buchbare Extras für Fotobox)

---

## Projektstruktur

```
knipserl/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard Home
│   │   │   ├── inquiries/            # Anfragen
│   │   │   ├── orders/               # Aufträge
│   │   │   ├── calendar/             # Kalender
│   │   │   ├── drivers/              # Fahrerverwaltung
│   │   │   ├── accounting/
│   │   │   │   ├── quotes/           # Angebote
│   │   │   │   ├── invoices/         # Ausgangsrechnungen
│   │   │   │   ├── incoming/         # Eingangsrechnungen
│   │   │   │   └── bank/             # Bankabgleich
│   │   │   ├── statistics/           # Statistiken
│   │   │   └── settings/             # Einstellungen
│   │   ├── (driver)/                 # Fahrer-Portal
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   └── vacation/
│   │   └── api/
│   │       ├── inquiries/            # Anfrage-API (extern + intern)
│   │       ├── orders/
│   │       ├── drivers/
│   │       ├── accounting/
│   │       ├── bank/
│   │       └── auth/
│   ├── components/
│   │   ├── ui/                       # shadcn/ui Komponenten
│   │   ├── layout/                   # Sidebar, Header, etc.
│   │   ├── forms/                    # Formular-Komponenten
│   │   └── charts/                   # Chart-Komponenten
│   ├── lib/
│   │   ├── db.ts                     # Prisma Client
│   │   ├── auth.ts                   # NextAuth Config
│   │   ├── fints.ts                  # FinTS Bank-Anbindung
│   │   ├── ocr.ts                    # KI Rechnungserkennung
│   │   ├── pdf.ts                    # PDF-Generierung
│   │   ├── email.ts                  # E-Mail Service
│   │   └── maps.ts                   # Adress/KM-Berechnung
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts
├── docker-compose.yml
├── Dockerfile
├── .github/workflows/deploy.yml
├── KONZEPT.md
└── README.md
```

---

## Umsetzungsphasen

### Phase 1 – Basis
Projekt-Setup, Authentifizierung, Datenmodell, Anfrage-API + Anfrage-Management

### Phase 2 – Aufträge
Auftrags-Workflow, Fahrer-Portal, Kalenderansicht

### Phase 3 – Buchhaltung
Angebote, Rechnungen, PDF-Generierung, E-Mail-Versand

### Phase 4 – Bank & KI
FinTS-Anbindung, Bankabgleich, Eingangsrechnungen mit KI-OCR

### Phase 5 – Metriken
Statistik-Dashboard, Charts, Exporte

### Phase 6 – Deployment
Docker-Setup, CI/CD Pipeline, Hetzner-Deployment

---

## Hosting & Deployment

- **Server:** Hetzner (eigener Server)
- **Container:** Docker + Docker Compose (Next.js + PostgreSQL + ggf. Redis)
- **CI/CD:** GitHub Actions – automatisches Deployment bei Push auf `main`
- **SSL:** Let's Encrypt via Caddy oder Traefik
- **Backups:** Automatische PostgreSQL-Backups (pg_dump Cronjob)
