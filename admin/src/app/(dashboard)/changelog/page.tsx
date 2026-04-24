import { readFile } from "node:fs/promises";
import path from "node:path";
import { IconHistory } from "@tabler/icons-react";

async function readChangelog(relativePaths: string[]): Promise<string | null> {
  for (const rel of relativePaths) {
    try {
      const filePath = path.resolve(process.cwd(), rel);
      return await readFile(filePath, "utf8");
    } catch {
      // weiter zum nächsten Fallback
    }
  }
  return null;
}

async function readVersion(relativePkgPaths: string[]): Promise<string | null> {
  for (const rel of relativePkgPaths) {
    try {
      const filePath = path.resolve(process.cwd(), rel);
      const raw = await readFile(filePath, "utf8");
      const pkg = JSON.parse(raw) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      // weiter zum nächsten Fallback
    }
  }
  return null;
}

type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    blocks.push({ kind: "p", text: line.trim() });
    i++;
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(<code key={key++} className="rounded bg-foreground/[0.06] px-1 py-0.5 text-[12px] font-mono text-foreground">{token.slice(1, -1)}</code>);
    } else {
      const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (m) parts.push(<a key={key++} href={m[2]} className="text-primary hover:underline" target="_blank" rel="noreferrer">{m[1]}</a>);
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

function ChangelogBody({ source, source404 }: { source: string | null; source404: string }) {
  if (!source) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {source404}
      </p>
    );
  }
  const blocks = parseMarkdown(source);
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.kind === "h2") {
          return (
            <h2 key={i} className="text-lg font-bold text-primary pt-4 first:pt-0 border-t first:border-t-0 border-border">
              {renderInline(b.text)}
            </h2>
          );
        }
        if (b.kind === "h3") {
          return (
            <h3 key={i} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-3">
              {renderInline(b.text)}
            </h3>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="space-y-1.5 text-sm text-foreground/80">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-primary shrink-0 mt-1.5">&bull;</span>
                  <span className="leading-relaxed">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

export default async function ChangelogPage() {
  const [adminMd, webseiteMd, adminVersion, webseiteVersion] = await Promise.all([
    // Admin-CHANGELOG liegt im Root des Admin-Workspaces (lokal + Docker).
    readChangelog(["CHANGELOG.md"]),
    // Webseite-CHANGELOG: lokal über `../webseite/CHANGELOG.md`,
    // im Docker-Image via CI nach `.webseite/CHANGELOG.md` gespiegelt.
    readChangelog(["../webseite/CHANGELOG.md", ".webseite/CHANGELOG.md"]),
    readVersion(["package.json"]),
    readVersion(["../webseite/package.json", ".webseite/package.json"]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconHistory className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Changelog</h1>
          <p className="text-sm text-muted-foreground">
            Versionen und Änderungen der Admin Console und der öffentlichen Webseite.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Admin Console</h2>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Dashboard unter admin.knipserl.de</p>
            </div>
            {adminVersion && (
              <span className="inline-flex items-center rounded-md bg-primary/15 text-primary px-2.5 py-1 text-xs font-mono font-semibold border border-primary/25">
                v{adminVersion}
              </span>
            )}
          </header>
          <ChangelogBody source={adminMd} source404="Admin-Changelog nicht gefunden." />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Webseite</h2>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Öffentliche Seite unter www.knipserl.de</p>
            </div>
            {webseiteVersion && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-400 px-2.5 py-1 text-xs font-mono font-semibold border border-emerald-500/25">
                v{webseiteVersion}
              </span>
            )}
          </header>
          <ChangelogBody source={webseiteMd} source404="Webseiten-Changelog nicht gefunden." />
        </section>
      </div>
    </div>
  );
}
