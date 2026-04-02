import type { Metadata } from "next";
import InquiryForm from "@/components/forms/InquiryForm";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Termin prüfen & Fotobox reservieren",
  description:
    "Prüfe jetzt ob die Knipserl Fotobox an Deinem Wunschtermin verfügbar ist. Unverbindliche Anfrage in nur 2 Minuten.",
  path: "/termin-reservieren",
});

export default function TerminReservierenPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Termin reservieren", url: "/termin-reservieren" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Termin reservieren" />

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="max-w-[700px] mx-auto px-4">
          <div className="bg-white p-6 md:p-8 border border-gray-200">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
