import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knipserl – Layout Designer",
  description: "Gestalte dein Fotobox-Layout",
  robots: { index: false, follow: false },
};

export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="h-14 flex items-center justify-center border-b border-border">
        <img src="/logo.png" alt="Knipserl" className="h-8" />
      </header>
      <main>{children}</main>
    </div>
  );
}
