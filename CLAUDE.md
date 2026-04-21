## Ehrliches Feedback

- Sei mein Sparring-Partner
- Sei kritisch mit mir, finde meine Schwachstellen, finde meine blinden Flecken
- Stimme mir nicht einfach zu — prüfe erst ob es stimmt
- Sag mir die Wahrheit, auch wenn sie unbequem ist
- Verletze ruhig meine Gefühle wenn nötig, sei absolut direkt und ehrlich
- Keine Floskeln wie „Großartige Frage!" oder „Du hast absolut recht!"
- Wenn ich eine Entscheidung treffe, nenne mir die Risiken bevor du zustimmst

## DB-Schema synchron halten

Es gibt keine Prisma-Migrations. Die DB wird beim Container-Start über `admin/sync-schema.cjs` synchronisiert.

**Bei JEDER Prisma-Schema-Änderung MUSS `admin/sync-schema.cjs` mitgepflegt werden:**
- Neue Spalte → `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` eintragen
- Neue Tabelle → `CREATE TABLE IF NOT EXISTS` + alle Spalten eintragen
- Neuer Enum-Wert → `ALTER TYPE ... ADD VALUE IF NOT EXISTS` eintragen
- Vor dem Push prüfen: Stimmt sync-schema.cjs mit schema.prisma überein?

Hintergrund: `prisma db push` läuft nicht zuverlässig im Docker-Container. Ohne sync-schema.cjs führen fehlende Spalten zu 500er-Fehlern auf Production/Dev.

## Versionierung & Changelog (Webseite + Admin)

Claude pflegt eigenständig Versionen und Changelogs für beide Projekte. Der Nutzer sieht beide Changelogs in der Admin Console unter `/changelog`.

**Dateien:**
- `webseite/package.json` — `version`
- `webseite/CHANGELOG.md`
- `admin/package.json` — `version`
- `admin/CHANGELOG.md`
- `admin/src/app/(dashboard)/changelog/page.tsx` — Reader (liest beide MD-Files via `fs.readFile` aus dem Monorepo-Root)

**Regeln für Claude (gilt für JEDE Änderung, die committed wird):**

1. **Scope ermitteln:** Welche Projekte hat der Commit verändert?
   - Nur `webseite/` → nur Webseite-Version + Webseite-Changelog anpassen
   - Nur `admin/` → nur Admin-Version + Admin-Changelog anpassen
   - Beide → beide anpassen
   - Ausschließlich Meta-Files (`CLAUDE.md`, README, `.gitignore`) → keine Versionsänderung nötig

2. **SemVer-Bump wählen:**
   - **PATCH** (`1.2.3 → 1.2.4`): Bugfix, UI-Tweak, Copy-Änderung, Mobile-Polish, kleine SEO-Anpassung
   - **MINOR** (`1.2.3 → 1.3.0`): neues Feature, neue Seite/Bereich, neue Integration, neuer Workflow
   - **MAJOR** (`1.2.3 → 2.0.0`): Breaking Change (URL-Struktur, Schema-Migration mit Downtime, API-Bruch, Auth-Umbau)

3. **Changelog-Eintrag schreiben:**
   - Kategorien in Reihenfolge: **Added** → **Changed** → **Fixed** → **Removed** → **Security**
   - Eintrag nach Muster `## [x.y.z] — YYYY-MM-DD` (absolutes Datum, nicht relativ)
   - Bullet-Points konkret und nutzerlesbar (nicht "Fix bug XY" sondern "Umsatzzahl bricht auf Mobile nicht mehr auf zwei Zeilen").
   - Mehrere kleine Änderungen des Tages können in denselben Eintrag geschoben werden, wenn dieser noch "unveröffentlicht" ist (gleiches Datum). Sobald ein neuer Tag ansteht oder ein größerer Bump erfolgt, neue Section anlegen.

4. **Änderungen werden als Teil des Commits gepusht** — nicht als separater "bump"-Commit. So bleiben Code + Version + Changelog synchron.

5. **Bei Unsicherheit** (z.B. „war das MINOR oder PATCH?"): im Zweifel das konservativere (niedrigere) Bump wählen.

Nicht zu pflegen: `node_modules`-Versionen, Dependency-Updates (sind in `package.json` selbst versioniert), Format-Drift (Whitespace-Only).
