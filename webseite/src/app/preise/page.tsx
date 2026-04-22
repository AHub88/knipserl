import type { Metadata } from "next";
import PriceConfigurator from "@/components/forms/PriceConfigurator";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Preiskonfigurator | Fotobox ab 379€",
  description:
    "Fotobox mieten ab 379€ inkl. Drucker, Auf- & Abbau und Druckpaket. Stelle Dein Paket im Preiskonfigurator zusammen. Fahrtkosten automatisch berechnet.",
  path: "/preise",
});

export default function PreisePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Preiskonfigurator", url: "/preise" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Preiskonfigurator" />
      <PriceConfigurator />
    </>
  );
}
