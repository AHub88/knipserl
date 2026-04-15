import type { Metadata } from "next";
import Script from "next/script";
import ContactForm from "@/components/forms/ContactForm";
import { generatePageMetadata, generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/seo";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_URL,
} from "@/lib/constants";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Kontakt",
  description:
    "Kontaktiere Knipserl Fotobox – per Telefon, E-Mail oder WhatsApp. Persönliche Beratung, Rückmeldung innerhalb 24 Stunden.",
  path: "/kontakt",
});

export default function KontaktPage() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_URL}/kontakt#page`,
    url: `${SITE_URL}/kontakt`,
    name: `Kontakt | ${SITE_NAME}`,
    description:
      "Kontaktiere Knipserl Fotobox – per Telefon, E-Mail oder WhatsApp. Persönliche Beratung, Rückmeldung innerhalb 24 Stunden.",
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: CONTACT_PHONE,
          email: CONTACT_EMAIL,
          contactType: "customer service",
          areaServed: ["DE", "AT"],
          availableLanguage: ["German"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "08:00",
            closes: "22:00",
          },
        },
      ],
    },
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Kontakt", url: "/kontakt" },
  ]);

  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      <Script
        id="schema-contact-page"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <Script
        id="schema-contact-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="schema-contact-localbusiness"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <PageHeader title="Kontakt" />

      <section className="py-14 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-[28px] md:text-[44px] leading-[1.1] text-[#1a171b] uppercase font-[family-name:var(--font-fira-condensed)] font-extrabold tracking-[0.02em]">
              Schreib uns — wir melden uns zeitnah
            </h1>
            <p className="mt-4 text-[#666] text-[16px] md:text-[18px] max-w-[680px] mx-auto" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              Egal ob Hochzeit, Firmenfeier oder Geburtstag — wir beraten Dich persönlich und beantworten alle Fragen rund um Fotobox, Audio-Gästebuch und Extras.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14">
            {/* Left: Form */}
            <div>
              <h2 className="text-[22px] md:text-[28px] leading-[1.2] text-[#1a171b] mb-6 uppercase font-[family-name:var(--font-fira-condensed)] font-extrabold tracking-[0.02em]">
                Schreib uns eine Nachricht
              </h2>
              <ContactForm />
            </div>

            {/* Right: Contact info */}
            <div>
              <h2 className="text-[22px] md:text-[28px] leading-[1.2] text-[#1a171b] mb-6 uppercase font-[family-name:var(--font-fira-condensed)] font-extrabold tracking-[0.02em]">
                So erreichst Du uns
              </h2>

              {/* WhatsApp CTA — prominent */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#25D366] hover:bg-[#1fb955] transition-colors rounded-md p-5 mb-6 shadow-[0_4px_16px_rgba(37,211,102,0.25)] group"
              >
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-white/20 text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.5 3.4A11.9 11.9 0 0012 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6A12 12 0 0012 24c6.6 0 12-5.4 12-12 0-3.2-1.3-6.2-3.5-8.6zM12 22c-1.9 0-3.7-.5-5.3-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 012 12C2 6.5 6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm5.4-7.5c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.9 1.2 3c.1.2 2 3.2 5 4.5.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4 0-.1-.2-.2-.5-.3z"/>
                    </svg>
                  </span>
                  <div className="flex-1 text-white">
                    <div className="text-[20px] leading-tight font-[family-name:var(--font-fira-condensed)] font-extrabold uppercase tracking-wide">
                      WhatsApp-Chat starten
                    </div>
                    <div className="text-[13px] opacity-90" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none" }}>
                      Schnellste Antwort · meist innerhalb weniger Minuten
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white opacity-80 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </a>

              <div className="space-y-5" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-[#F3A300]/15 text-[#F3A300]">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-[13px] uppercase text-[#999] tracking-wider mb-0.5">E-Mail</div>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a171b] hover:text-[#F3A300] text-[16px] font-semibold break-all">
                      {CONTACT_EMAIL}
                    </a>
                    <div className="text-[13px] text-[#999] mt-0.5">Antwort in der Regel innerhalb weniger Stunden</div>
                  </div>
                </div>

              </div>

              {/* Knipsi mascot */}
              <div className="mt-8 flex justify-center lg:justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/misc/knipsi-party.png"
                  alt="Knipsi Maskottchen"
                  width={220}
                  height={220}
                  className="w-[180px] md:w-[220px] h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
