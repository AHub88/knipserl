import type { Metadata } from "next";
import InquiryForm from "@/components/forms/InquiryForm";
import { generatePageMetadata } from "@/lib/seo";
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY, WHATSAPP_URL } from "@/lib/constants";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Kontakt",
  description:
    "Kontaktiere Knipserl Fotobox – per Telefon, E-Mail oder WhatsApp. Wir beraten Dich gerne!",
  path: "/kontakt",
});

export default function KontaktPage() {
  return (
    <>
      <PageHeader title="Kontakt" />

      <section className="py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-6">So erreichst Du uns</h2>
              <div className="space-y-5 text-[#666]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <div>
                  <h3 className="text-[18px] leading-[1.2] text-[#1a171b] mb-1">Telefon</h3>
                  <a href={`tel:${CONTACT_PHONE}`} className="text-[#F3A300] hover:underline text-[18px]">
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </div>
                <div>
                  <h3 className="text-[18px] leading-[1.2] text-[#1a171b] mb-1">E-Mail</h3>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#F3A300] hover:underline text-[16px]">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div>
                  <h3 className="text-[18px] leading-[1.2] text-[#1a171b] mb-1">WhatsApp</h3>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-[#F3A300] hover:underline text-[16px]">
                    Nachricht senden
                  </a>
                </div>
                <div className="pt-2">
                  <h3 className="text-[18px] leading-[1.2] text-[#1a171b] mb-2">Anschrift</h3>
                  <address className="not-italic text-[16px] leading-relaxed">
                    {ADDRESS.name}
                    <br />
                    {ADDRESS.owner}
                    <br />
                    {ADDRESS.street}
                    <br />
                    {ADDRESS.zip} {ADDRESS.city}
                  </address>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-[24px] md:text-[32px] leading-[1.2] text-[#1a171b] mb-6">Nachricht senden</h2>
              <div className="bg-white p-6 border border-gray-200">
                <InquiryForm compact />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
