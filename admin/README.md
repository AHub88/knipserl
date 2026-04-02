# Knipserl Fotobox — Admin Dashboard

Admin Dashboard für die Verwaltung der Knipserl Fotobox. Anfragen, Aufträge, Fahrer, Buchhaltung und Bankabgleich – alles in einer Anwendung.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Prisma ORM
- **shadcn/ui** + Tailwind CSS + Tabler Icons
- **NextAuth.js** (rollenbasierte Authentifizierung)
- **FinTS/HBCI** (Sparkasse Bankabgleich)
- **Docker** (Deployment auf Hetzner)

## Features

- Anfrage- & Auftrags-Management mit vollständigem Workflow
- Fahrer-Portal (mobile-optimiert) mit Selbstzuweisung & Urlaubsverwaltung
- Buchhaltung mit zwei Firmierungen (Einzelunternehmen + GbR)
- Angebote & Rechnungen mit PDF-Generierung
- Eingangsrechnungen mit KI-OCR-Erkennung
- Bankabgleich via FinTS (Sparkasse)
- Umfassende Statistiken & Metriken
- Kalenderansicht mit Engpass-Warnung

Siehe [KONZEPT.md](KONZEPT.md) für das vollständige Konzept.

## Entwicklung

```bash
# Dependencies installieren
pnpm install

# Datenbank starten
docker compose up -d postgres

# Prisma Migrationen ausführen
pnpm prisma migrate dev

# Entwicklungsserver starten
pnpm dev
```

## Deployment

```bash
# Produktion via Docker
docker compose up -d
```

## Lizenz

Privat – Alle Rechte vorbehalten.
