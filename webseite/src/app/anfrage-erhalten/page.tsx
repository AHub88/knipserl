import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/layout/PageHeader";
import { generatePageMetadata } from "@/lib/seo";
import InquirySummary from "./InquirySummary";

const base = generatePageMetadata({
  title: "Anfrage erhalten",
  description:
    "Vielen Dank für Deine Anfrage. Wir melden uns schnellstmöglich bei Dir zurück.",
  path: "/anfrage-erhalten",
});

// Dankesseite soll nicht indexiert werden
export const metadata: Metadata = {
  ...base,
  robots: { index: false, follow: false },
};

export default function AnfrageErhaltenPage() {
  return (
    <>
      <PageHeader title="Anfrage erhalten" />

      <section className="py-14 md:py-20 text-center">
        <div className="max-w-[760px] mx-auto px-6">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
            Knipsi sagt Danke!
          </h2>
          <p className="text-[23px] text-[#F3A300] font-semibold mt-0 font-[family-name:var(--font-fira-condensed)]">
            Wir haben Deine Anfrage erhalten
          </p>

          <div className="mt-8 flex justify-center">
            <Image
              src="/images/misc/knipsi-firmenfeier.png"
              alt="Knipsi-Maskottchen"
              width={342}
              height={264}
              priority
            />
          </div>

          <p className="text-[18px] text-[#444] mt-8 max-w-[560px] mx-auto" style={{ fontWeight: 400, textTransform: "none" }}>
            Wir melden uns schnellstmöglich bei Dir zurück — in der Regel innerhalb von 24 Stunden.
            Schau bitte auch in Deinen Spam-Ordner, falls keine Bestätigung ankommt.
          </p>

          <InquirySummary />

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-brand">Zur Startseite</Link>
            <a
              href="https://wa.me/4915792495836"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-dark"
            >
              WhatsApp-Nachricht schreiben
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
