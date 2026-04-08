import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import LottieIcon from "@/components/LottieIcon";
import GoogleReviewsSlider, { type ReviewData } from "@/components/GoogleReviewsSlider";
import { SEO_CITIES } from "@/lib/constants";

type LogoData = { name: string; src: string };

async function getClientLogos(): Promise<LogoData[]> {
  // Internal URL for server-side fetch (container-to-container)
  const adminInternal = process.env.ADMIN_API_URL;
  // Public URL (used for browser-facing image src AND as fetch fallback)
  const adminPublic = process.env.ADMIN_PUBLIC_URL;

  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];
  if (fetchUrls.length === 0) return [];

  // Try internal first, then public
  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/client-logos`, {
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = await res.json();
      // Always use public URL for image src (browser needs to load them)
      const imageBase = adminPublic || baseUrl;
      return data.logos.map((l: { name: string; filename: string }) => ({
        name: l.name,
        src: `${imageBase}/api/uploads/client-logos/${l.filename}`,
      }));
    } catch {
      continue;
    }
  }
  return [];
}

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

// Force dynamic rendering so runtime env vars (ADMIN_API_URL etc.) are available
export const dynamic = "force-dynamic";

const galleryImages = [
  { src: "/images/gallery/fotobox-mieten-5.jpg", alt: "Fotobox im Einsatz bei einer Hochzeit in Rosenheim" },
  { src: "/images/gallery/fotobox-mieten-7.jpg", alt: "Gäste haben Spaß mit der Knipserl Fotobox" },
  { src: "/images/gallery/fotobox-mieten-3.jpg", alt: "Fotobox Ausdruck mit individuellen Designs" },
  { src: "/images/gallery/fotobox-rosenheim-bild2.jpg", alt: "Knipserl Fotobox auf einer Firmenfeier" },
  { src: "/images/gallery/touchscreen.gif", alt: "Fotobox Touchscreen Bedienung" },
  { src: "/images/gallery/fotobox-mieten-2.jpg", alt: "Professionelle Fotobox mit Requisiten" },
  { src: "/images/gallery/fotobox-mieten-1.gif", alt: "Fotobox GIF Animation" },
  { src: "/images/gallery/fotobox-mieten-5-scaled.jpg", alt: "Fotobox mieten für Events in Oberbayern" },
];

export default async function HomePage() {
  const [clientLogos, reviewData] = await Promise.all([
    getClientLogos(),
    getGoogleReviews(),
  ]);
  return (
    <>
      {/* ===== HERO / SLIDER ===== */}
      <section className="relative h-[70vh] md:h-[85vh] lg:h-[100vh] overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/hero/fotobox-rosenheim-muenchen.jpg"
          alt="Knipserl Fotobox mieten in Rosenheim und München"
          fill
          className="object-cover object-center md:object-[center_20%]"
          priority
          quality={85}
        />

        {/* Fotobox - centered on mobile, left on desktop */}
        <div className="absolute z-20 left-1/2 -translate-x-1/2 md:left-[8%] md:translate-x-0 lg:left-[10%] bottom-[40px] md:bottom-[30px] w-[220px] h-[370px] md:w-[300px] md:h-[500px] lg:w-[420px] lg:h-[680px]">
          <Image
            src="/images/hero/fotobox-startseite.png"
            alt="Knipserl Fotobox mit Stativ und Blitz"
            fill
            className="object-contain object-bottom drop-shadow-2xl"
            priority
          />
        </div>

        {/* Text - hidden on mobile, visible from tablet */}
        <div className="absolute z-20 text-white hidden md:block md:left-[38%] md:top-[35%] md:max-w-[58%] lg:left-[40%] lg:top-[40%] lg:max-w-[55%]">
          <h1
            className="text-[60px] md:text-[90px] lg:text-[130px] leading-[0.9] mb-3"
            style={{
              fontFamily: "'Beyond The Mountains', cursive",
              textTransform: "none",
              fontWeight: 400,
              textShadow: "3px 3px 10px rgba(0,0,0,0.4)",
            }}
          >
            Deine Fotobox
          </h1>
          <p
            className="text-[22px] md:text-[30px] lg:text-[40px] leading-[1.1] mb-4 md:mb-6 font-medium font-[family-name:var(--font-fira-sans)]"
            style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.4)" }}
          >
            für Rosenheim, München und Umgebung
          </p>
          <Link
            href="/termin-reservieren"
            className="inline-block px-6 py-3 md:px-10 md:py-4 bg-white text-[#1a171b] font-bold text-[16px] md:text-[18px] uppercase tracking-[0.1em] rounded-md hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif" }}
          >
            Jetzt reservieren
          </Link>
        </div>

        {/* Dark gradient to mask water behind tripod on mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] md:h-[150px] bg-gradient-to-t from-[#1a171b] via-[#1a171b]/70 to-transparent z-[5]" />

        {/* Holzsteg at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Image
            src="/images/hero/steg.png"
            alt=""
            width={1920}
            height={217}
            className="w-full min-h-[70px] object-cover object-top md:min-h-0 md:h-auto"
            priority
          />
        </div>
      </section>

      {/* ===== DARK CTA BAR ===== */}
      <section
        className="relative z-10 pt-10 pb-20 rough-bottom"
        style={{ background: `#666 url('/images/misc/main_back_gr-2.webp') repeat`, backgroundSize: '1000px 500px' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 lg:gap-8 text-center lg:text-left">
          <div className="text-white lg:max-w-[550px]">
            <h2 className="text-[28px] md:text-[40px] lg:text-[52px] leading-[1] font-[800]">
              <span className="text-[#F3A300]">Fotobox</span> für Rosenheim,{" "}
              München und Umgebung
            </h2>
            <p className="text-[16px] md:text-[18px] lg:text-[20px] leading-[24px] lg:leading-[28px] mt-3 font-normal font-[family-name:var(--font-fira-sans)]">
              Miete jetzt unsere Fotobox für Deine{" "}
              <Link href="/preise" className="text-[#F3A300] underline hover:no-underline">Hochzeit</Link>,{" "}
              <Link href="/preise" className="text-[#F3A300] underline hover:no-underline">Firmenfeier</Link>,{" "}
              <Link href="/preise" className="text-[#F3A300] underline hover:no-underline">Messe</Link>{" "}
              oder Party.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Link href="/impressionen" className="btn-outline">Bilder</Link>
            <Link href="/preise" className="btn-outline">Preise</Link>
            <Link href="/termin-reservieren" className="btn-brand">Anfragen</Link>
          </div>
        </div>
      </section>

      {/* ===== INTRO / ABOUT ===== */}
      <section className="py-20 relative z-10" style={{ marginTop: "80px" }}>
        <div className="max-w-[1100px] mx-auto px-6">
          {/* Heading with sparks */}
          <div className="text-center mb-12">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Fotobox mit Sofortdruck! Ab 379 EUR
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Hochwertige Technik und 24/7 Support garantieren eine sorgenfreie Feier
            </p>
          </div>

          {/* Two column: image + text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <Image
                src="/images/hero/fotobox-startseite-teaser.jpg"
                alt="Knipserl Fotobox im Einsatz bei einer Party"
                width={739}
                height={900}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 500px"
                quality={85}
              />
            </div>
            <div className="text-[#1a171b] text-lg leading-relaxed space-y-5">
              <p>
                Du willst eine urige <strong>Fotobox für deine Hochzeit</strong> oder{" "}
                <em><strong>Party</strong></em> mieten? Dann bist du bei Knipserl genau richtig!
                Bei uns kannst Du eine hochwertige Fotobox mit eingebautem{" "}
                <strong>Profi-Drucker</strong> und einer{" "}
                <strong>hochauflösenden Spiegelreflexkamera</strong> mieten.
              </p>
              <p>
                Du musst Dich den ganzen Abend um nichts kümmern. Wir erledigen den Aufbau
                und Abbau und unser Knipserl ist für deine Gäste absolut selbsterklärend.
                Vor Ort ist keine Betreuung nötig.
              </p>
              <p>
                Wir liefern Dir die Fotobox in folgende Landkreise:{" "}
                <Link href="/fotobox/rosenheim" className="text-[#1a171b] font-bold underline hover:text-[#F3A300]">Rosenheim</Link>,{" "}
                <Link href="/fotobox/muenchen" className="text-[#1a171b] font-bold underline hover:text-[#F3A300]">München</Link>,{" "}
                <Link href="/fotobox/ebersberg" className="text-[#F3A300] font-bold underline hover:no-underline">Ebersberg</Link>,{" "}
                Mühldorf am Inn, Erding,{" "}
                <Link href="/fotobox/miesbach" className="text-[#1a171b] font-bold underline hover:text-[#F3A300]">Miesbach</Link>,{" "}
                <Link href="/fotobox/traunstein" className="text-[#1a171b] font-bold underline hover:text-[#F3A300]">Traunstein</Link>,{" "}
                <strong>Wasserburg am Inn</strong> und auch nach{" "}
                <strong>Kufstein</strong>.
              </p>
              <div className="pt-2">
                <Link href="/termin-reservieren" className="btn-brand text-[16px] px-[15px] py-[12px] rounded-[3px]">
                  Jetzt reservieren
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section
        className="relative py-24 rough-top rough-bottom overflow-hidden"
        style={{ marginTop: "20px" }}
      >
        <Image
          src="/images/misc/block-bg-wedding.jpg"
          alt=""
          fill
          className="object-cover"
          quality={60}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 w-full px-[5%] lg:px-[3%] xl:px-[10%]">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-white inline-block">
              Fotobox Features
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Perfekt ausgestattet für Deine Party
            </p>
          </div>

          {/* Features grid: 3 columns with fotobox in center of top row concept */}
          {/* Row 1: 2 cards | Fotobox image | 2 cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 text-center lg:text-right">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Hochwertige Kamera</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      In unseren Fotoboxen sind professionelle <strong>Spiegelreflexkameras</strong> mit
                      einer Auflösung von <strong>16 Megapixel</strong> verbaut.
                    </p>
                  </div>
                  <LottieIcon src="/icons/camera.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 text-center lg:text-right">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Individuelles Drucklayout</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Wir gestalten Euren Ausdruck ganz individuell nach Euren Wünschen.
                      Ihr könnte Euch zwischen dem Format 10x15cm und 5x15cm entscheiden.
                    </p>
                  </div>
                  <LottieIcon src="/icons/print-layout.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 text-center lg:text-right">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Riesiger Touchscreen</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Ihr könnt unsere Fotobox direkt über den großen Full-HD Touchscreen
                      (22 Zoll!) steuern. Die Bedienung ist kinderleicht!
                    </p>
                  </div>
                  <LottieIcon src="/icons/touchscreen.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 text-center lg:text-right">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Individualisierung / Startscreen</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Unsere Box kann auch von außen für Euch individualisiert werden. Gegen
                      Aufpreis erstellen wir einen eigenen Startscreen, auch die Farben der
                      verbauten LEDs können auf Euer Event abgestimmt werden.
                    </p>
                  </div>
                  <LottieIcon src="/icons/startscreen.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                </div>
              </div>
            </div>

            {/* Center: Fotobox image + CTA */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-full h-[650px]">
                <Image
                  src="/images/hero/fotobox-startseite.png"
                  alt="Knipserl Fotobox"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
              <Link href="/termin-reservieren" className="btn-brand mt-6">
                Jetzt reservieren
              </Link>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <LottieIcon src="/icons/sofortdruck.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Sofortdruck</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Unser professioneller <strong>Fotodrucker</strong> schafft es, Fotos innerhalb{" "}
                      <strong>7 Sekunden</strong> auszudrucken. Die Kapazität von bis zu{" "}
                      <strong>800 Fotos</strong> reicht für eine Tagesveranstaltung locker aus.
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <LottieIcon src="/icons/online-galerie.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Online-Galerie</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Du bekommst von uns eine Online Galerie mit gesichertem Zugang. Deine
                      Gäste haben so die Möglichkeit alle geschossenen Bilder von zu Hause aus
                      anzusehen und herunterzuladen.
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <LottieIcon src="/icons/gif-animation.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">GIF Animation</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Unsere Fotobox erstellt automatisch aus den geschossenen Bildern eine
                      GIF-Animation. Diese können sich die Gäste noch einmal anzeigen lassen
                      oder über unsere Online-Funktion direkt aufs Handy schicken lassen.
                    </p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex flex-col items-center lg:flex-row lg:items-start gap-4">
                  <LottieIcon src="/icons/fotoeffekte.json" className="flex-shrink-0 w-[100px] h-[100px] lg:w-[80px] lg:h-[80px] xl:w-[120px] xl:h-[120px]" />
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-[28px] font-extrabold mb-2 uppercase leading-tight font-[family-name:var(--font-fira-condensed)]">Fotoeffekte</h3>
                    <p className="text-base text-gray-200 leading-snug">
                      Direkt nachdem das Foto geschossen wurde, können Deine Gäste zwischen
                      diversen Fotoeffekten (Wie z.B. auf Instagram) wählen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INQUIRY FORM ===== */}
      <section id="buchen" className="py-20 relative z-10" style={{ marginTop: "80px" }}>
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Unverbindlich Anfragen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt ob eine Fotobox an Deinem Event verfügbar ist
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* ===== IMPRESSIONEN / GALLERY ===== */}
      <section
        id="impressionen"
        className="relative py-24 rough-top rough-bottom overflow-hidden"
      >
        <Image
          src="/images/misc/main_back_gr.jpg"
          alt=""
          fill
          className="object-cover"
          quality={60}
        />
        <div className="relative z-10 max-w-[1300px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-white inline-block">
              Impressionen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Unsere Fotobox im Einsatz
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden group cursor-pointer">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KUNDENREZENSIONEN ===== */}
      <section className="py-20 relative z-10" style={{ marginTop: "80px" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Rezensionen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Das sagen unsere Kunden zum Knipserl
            </p>
          </div>
          {reviewData && <GoogleReviewsSlider data={reviewData} />}
        </div>
      </section>

      {/* ===== REFERENZ-LOGOS ===== */}
      <section className="py-20 relative bg-white">
        <div className="w-full mx-auto px-[3%] lg:px-[5%]">
          <div className="text-center mb-14">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Referenzen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Auswahl unserer Kunden
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {clientLogos.map((logo) => (
              <div key={logo.name} className="relative w-[130px] h-[70px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={`${logo.name} - Kunde von Knipserl Fotobox`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
