import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import GoogleReviewsSlider, { type ReviewData } from "@/components/GoogleReviewsSlider";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Audio-Gästebuch / Gästetelefon mieten",
  description:
    "Miete unser urige Gästetelefon als Audio-Gästebuch für Deine Hochzeit oder Party. Persönliche Sprachnachrichten als unvergessliche Erinnerung.",
  path: "/audio-gaestebuch",
});

export const dynamic = "force-dynamic";

async function getGoogleReviews(): Promise<ReviewData | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/google-reviews`, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      continue;
    }
  }
  return null;
}

const benefits = [
  {
    title: "Persönlicher Touch",
    description:
      "Jeder Gast kann seine Glückwünsche auf seine eigene Art und Weise ausdrücken – und verleiht ihnen so eine individuelle und emotionale Note.",
  },
  {
    title: "Einfache Handhabung",
    description:
      "Hörer abnehmen, Nachricht sprechen, auflegen – so einfach, dass es wirklich jeder Gast ohne lange Wartezeiten nutzen kann.",
  },
  {
    title: "Einzigartiges Andenken",
    description:
      "Eine moderne Alternative oder Ergänzung zum klassischen Gästebuch, die Ihr immer wieder anhören könnt.",
  },
];

const steps = [
  {
    step: "1",
    title: "Anfragen",
    text: "Prüfe Deinen Wunschtermin und sende uns eine unverbindliche Anfrage.",
  },
  {
    step: "2",
    title: "Aufbau",
    text: "Wir stellen das Gästetelefon bei Eurer Feier auf – ganz unkompliziert.",
  },
  {
    step: "3",
    title: "Erinnerungen erhalten",
    text: "Nach dem Event bekommst Du alle Aufnahmen als fertig bearbeitete Audio-Dateien.",
  },
];

const impressionen = [
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-005-605x453.jpg", alt: "Audio-Gästebuch Gästetelefon im Einsatz bei einer Hochzeit" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-015-605x453.jpg", alt: "Urige Gästetelefon Nahaufnahme" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-016-605x453.jpg", alt: "Gästetelefon mit Holzkasten" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-017-605x453.jpg", alt: "Gästetelefon als Audio-Gästebuch auf Feier" },
];

export default async function AudioGaestebuchPage() {
  const reviewData = await getGoogleReviews();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Audio-Gästebuch / Gästetelefon", url: "/audio-gaestebuch" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Audio-Gästebuch / Gästetelefon" />

      {/* ===== HERO INTRO ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Audio-Gästebuch / Gästetelefon
            </h2>
            <p className="text-[20px] md:text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              mieten für Eure Hochzeit oder Geburtstagsfeier
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-[#1a171b] text-[17px] md:text-[18px] leading-relaxed space-y-4" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              <p>
                Stell Dir vor, Du könntest die Freude und die Gefühle Deiner Gäste nicht nur
                sehen, sondern auch hören – immer und so oft Du willst. Ein{" "}
                <strong>Audio-Gästebuch</strong> ermöglicht genau das und ist eine neue Art
                des traditionellen Gästebuchs.
              </p>
              <p>
                Durch die Miete eines <strong>Gästetelefons</strong> kannst Du diese
                besondere Erfahrung auf Deiner Feier machen. Die herzlichen Wünsche und
                Nachrichten Deiner Gäste werden aufgenommen und bleiben für immer erhalten.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
                <Link href="/termin-reservieren" className="btn-brand whitespace-nowrap text-[18px] px-5 py-3">
                  Jetzt anfragen
                </Link>
                <Link href="/preise" className="btn-outline-dark whitespace-nowrap text-[18px] px-5 py-3">
                  Mit Fotobox kombinieren
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/audio-gaestebuch/audio-gaestebuch-mieten-1024x768.jpg"
                alt="Audio-Gästebuch Gästetelefon zum Mieten"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== DARK: WAS IST + VORTEILE ===== */}
      <section
        className="relative z-10 py-20 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1150px] mx-auto px-6">
          {/* Was ist */}
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              Was ist ein Gästetelefon?
            </h2>
          </div>
          <div className="max-w-[820px] mx-auto text-center">
            <p className="text-white/85 text-[17px] md:text-[18px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              Ein Gästetelefon – auch <strong>Hochzeitstelefon</strong>,{" "}
              <strong>Grußtelefon</strong> oder <strong>Audio-Gästebuch</strong> genannt –
              ist ein besonderes Telefon, das bei Deiner Veranstaltung aufgestellt wird.
              Deine Gäste hinterlassen darüber persönliche Nachrichten, Geschichten und
              Wünsche als Aufnahmen. Diese werden gespeichert und Dir nach dem Event als
              fertig bearbeitete Audio-Dateien übergeben.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/termin-reservieren" className="btn-brand">Jetzt buchen</Link>
              <Link href="#impressionen" className="btn-outline">Bilder?</Link>
            </div>
          </div>

          {/* Vorteile */}
          <div className="text-center mt-20 mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              Vorteile eines Gästetelefons
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {benefits.map((benefit, idx) => (
              <div
                key={benefit.title}
                className="glass-card p-8 pt-10 relative border-t-[3px] border-t-[#F3A300]"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#F3A300] text-[#1a171b] flex items-center justify-center font-bold text-[20px] shadow-lg font-[family-name:var(--font-fira-condensed)]">
                  {idx + 1}
                </div>
                <h3 className="text-[22px] md:text-[24px] leading-[1.2] text-[#F3A300] mb-3 text-center uppercase font-extrabold tracking-[0.02em] font-[family-name:var(--font-fira-condensed)]">
                  {benefit.title}
                </h3>
                <p className="text-white/85 text-[16px] text-center" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WIE FUNKTIONIERT DIE MIETE ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Wie funktioniert die Miete?
            </h2>
          </div>
          <p className="text-center text-[20px] md:text-[23px] text-[#F3A300] font-semibold mb-12 font-[family-name:var(--font-fira-condensed)]">
            Einfacher Ablauf für unvergessliche Erinnerungen
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 order-2 md:order-1">
              {steps.map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-[#F3A300] text-[#1a171b] rounded-full flex items-center justify-center font-bold text-[20px] flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-[20px] leading-[1.2] text-[#1a171b] mb-1">{item.title}</h3>
                    <p className="text-[#666] text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-[#666] text-[16px] pt-2" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                So bleiben die Stimmen und Botschaften Deiner Gäste für immer erhalten.
              </p>
            </div>
            <div className="relative aspect-[4/3] w-full order-1 md:order-2">
              <Image
                src="/images/audio-gaestebuch/audio-gaestebuch-mieten-015-605x453.jpg"
                alt="Gästetelefon im Einsatz"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 560px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPRESSIONEN ===== */}
      <section
        id="impressionen"
        className="relative z-10 py-20 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              Impressionen
            </h2>
          </div>
          <p className="text-center text-[20px] md:text-[23px] text-[#F3A300] font-semibold mb-12 font-[family-name:var(--font-fira-condensed)]">
            Unser Gästetelefon im Einsatz
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {impressionen.map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAZIT ===== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-10 items-start">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/images/audio-gaestebuch/audio-gaestebuch-mieten-016-605x453.jpg"
                alt="Gästebuchtelefon für Hochzeit"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>
            <div>
              <h2 className="text-[24px] md:text-[32px] leading-[1.1] text-[#1a171b] mb-5">
                Fazit: Mach Deine Hochzeit mit einem Gästebuchtelefon unvergesslich
              </h2>
              <p className="text-[#666] text-[17px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                Die Miete eines Gästebuchtelefons bietet Dir und Deinem Brautpaar eine
                moderne und emotionale Möglichkeit, die Glückwünsche Eurer Gäste auf eine
                ganz besondere Weise festzuhalten. Ob als Ergänzung zu einem herkömmlichen
                Gästebuch oder einer Fotobox – ein Gästebuchtelefon sorgt für bleibende
                Erinnerungen an Deine Hochzeitsfeier. Biete Deinen Gästen die Chance, ihre
                persönlichen Botschaften in einer Aufnahme zu verewigen und schaffe ein
                unvergleichliches Andenken an Deinen großen Tag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INQUIRY FORM ===== */}
      <section id="buchen" className="py-20 relative z-10">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Jetzt unverbindlich anfragen
            </h2>
            <p className="text-[20px] md:text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt ob ein Gästetelefon an Deinem Event verfügbar ist
            </p>
          </div>
          <InquiryForm preset="gaestetelefon" />
        </div>
      </section>

      {/* ===== KUNDENREZENSIONEN ===== */}
      <section className="py-20 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Kundenrezensionen
            </h2>
            <p className="text-[20px] md:text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Das sagen unsere Kunden zum Knipserl
            </p>
          </div>
          {reviewData && <GoogleReviewsSlider data={reviewData} />}
        </div>
      </section>
    </>
  );
}
