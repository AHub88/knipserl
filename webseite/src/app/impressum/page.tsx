import type { Metadata } from "next";
import { headers } from "next/headers";
import { generatePageMetadata } from "@/lib/seo";
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import { getAdminBaseUrl } from "@/lib/admin-url";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Impressum",
  description: "Impressum und Angaben gemäß § 5 TMG für Knipserl Fotobox.",
  path: "/impressum",
});

export const dynamic = "force-dynamic";

async function fetchLegalHtml(): Promise<string | null> {
  const host = (await headers()).get("host");
  const base = getAdminBaseUrl(host);
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/legal/impressum`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string };
    return typeof data.html === "string" ? data.html : null;
  } catch {
    return null;
  }
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
