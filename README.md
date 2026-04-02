# Knipserl Monorepo

Monorepo für die Knipserl Fotobox-Plattform.

## Struktur

```
/admin      → Admin Dashboard (admin.knipserl.de)
/webseite   → Website (www.knipserl.de)
/deploy     → Docker & Deployment Konfiguration
```

## Environments

| App | Dev | Production |
|-----|-----|------------|
| Website | dev.knipserl.de | www.knipserl.de |
| Admin | dev-admin.knipserl.de | admin.knipserl.de |

## Branching

- `main` → Production
- `dev` → Staging

## Deployment

Push auf `dev` oder `main` triggert automatisches Deployment via GitHub Actions.
