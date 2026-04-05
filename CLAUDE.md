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
