import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Impressum",
  description: "Impressum und Angaben gemäß § 5 TMG für Knipserl Fotobox.",
  path: "/impressum",
});

export const revalidate = 60;

async function fetchLegalHtml(): Promise<string | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const urls = [adminInternal, adminPublic].filter(Boolean) as string[];

  for (const base of urls) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/legal/impressum`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = (await res.json()) as { html?: string };
        if (typeof data.html === "string") return data.html;
      }
    } catch {
      // try next
    }
  }
  return null;
}

function FallbackContent() {
  return (
    <>
      <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-4">Angaben gemäß § 5 TMG</h2>
      <p className="text-[16px] leading-relaxed text-[#666] mb-8">
        {ADDRESS.owner}
        <br />
        {ADDRESS.name}
        <br />
        {ADDRESS.street}
        <br />
        {ADDRESS.zip} {ADDRESS.city}
      </p>
      <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-4">Kontakt</h2>
      <p className="text-[16px] leading-relaxed text-[#666] mb-8">
        Telefon: {CONTACT_PHONE_DISPLAY}
        <br />
        E-Mail: {CONTACT_EMAIL}
      </p>
      <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-4">Umsatzsteuer-ID</h2>
      <p className="text-[16px] leading-relaxed text-[#666] mb-8">
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <br />
        [USt-ID hier eintragen]
      </p>
      <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p className="text-[16px] leading-relaxed text-[#666]">
        {ADDRESS.owner}
        <br />
        {ADDRESS.street}
        <br />
        {ADDRESS.zip} {ADDRESS.city}
      </p>
    </>
  );
}

export default async function ImpressumPage() {
  const html = await fetchLegalHtml();
  const useFallback = !html || !html.trim();

  return (
    <>
      <PageHeader title="Impressum" />

      <section className="py-16 md:py-20">
        <div
          className="max-w-[800px] mx-auto px-4 text-[#1a171b]"
          style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}
        >
          {useFallback ? (
            <FallbackContent />
          ) : (
            <div className="legal-content text-[#666]" dangerouslySetInnerHTML={{ __html: html! }} />
          )}
        </div>
      </section>
    </>
  );
}
