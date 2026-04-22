import Link from "next/link";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  ADDRESS,
} from "@/lib/constants";
import GoogleReviewsBadge, { type ReviewSummary } from "@/components/GoogleReviewsBadge";

async function getReviewSummary(): Promise<ReviewSummary | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/google-reviews`, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      return { totalCount: data.totalCount, averageRating: data.averageRating };
    } catch {
      continue;
    }
  }
  return null;
}

const footerLinks = [
  { label: "Fotobox mieten Rosenheim", href: "/fotobox-rosenheim" },
  { label: "Fotobox mieten Ebersberg", href: "/fotobox-ebersberg" },
  { label: "Fotobox für Miesbach", href: "/fotobox-miesbach" },
  { label: "Fotobox mieten München", href: "/fotobox-fuer-muenchen" },
  { label: "Fotobox für Traunstein", href: "/fotobox-traunstein" },
  { label: "Fotobox mieten Erding", href: "/fotobox-erding" },
  { label: "Fotobox mieten Wasserburg", href: "/fotobox-wasserburg" },
  { label: "Fotobox mieten Mühldorf", href: "/fotobox-muehldorf" },
  { label: "Fotobox mieten Kufstein", href: "/fotobox-kufstein" },
  { label: "Fotobox für Hochzeit", href: "/fotobox-fuer-hochzeit" },
  { label: "Fotobox mieten für Firmenfeier", href: "/fotobox-fuer-firmenfeier" },
  { label: "Fotobox für Messe", href: "/fotobox-fuer-messe" },
  { label: "Fotobox für Weihnachtsfeier", href: "/fotobox-fuer-weihnachtsfeier" },
  { label: "XXL LOVE Leuchtbuchstaben", href: "/love-buchstaben" },
];

const legalLinks = [
  { label: "Aktuelles", href: "/" },
  { label: "Datenschutzerklärung", href: "/datenschutzerklaerung" },
  { label: "Impressum", href: "/impressum" },
  { label: "Kontakt", href: "/kontakt" },
];

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const reviewSummary = await getReviewSummary();

  return (
    <footer
      className="relative"
      itemScope
      itemType="https://schema.org/LocalBusiness"
      style={{
        background: `url('/images/misc/footer-bg.avif') repeat center top`,
        backgroundSize: "1920px auto",
      }}
    >
      {/* Papercut torn edge — matches original WP implementation */}
      <div
        className="w-full pointer-events-none"
        style={{
          height: "50px",
          marginTop: "-1px",
          position: "relative",
          background: "url('/images/misc/rough-top-footer.png') repeat-x",
          backgroundSize: "auto 50px",
          filter: "drop-shadow(0px 25px 11px rgba(0, 0, 0, .6))",
        }}
      />
      {/* Main footer content */}
      <div className="pt-20 pb-14">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_1.4fr] gap-10 text-white">
          {/* Anschrift */}
          <div>
            <h3
              className="text-white text-[28px] font-extrabold mb-5"
              style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif", textTransform: "uppercase" }}
            >
              Anschrift
            </h3>
            <address className="not-italic text-[15px] leading-relaxed" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="name" className="font-bold text-white">
                {ADDRESS.name}
              </span>
              <br />
              {ADDRESS.owner}
              <br />
              <span itemProp="streetAddress">{ADDRESS.street}</span>
              <br />
              <span itemProp="postalCode">{ADDRESS.zip}</span>{" "}
              <span itemProp="addressLocality">{ADDRESS.city}</span>
            </address>
          </div>

          {/* Kontakt */}
          <div>
            <h3
              className="text-white text-[28px] font-extrabold mb-5"
              style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif", textTransform: "uppercase" }}
            >
              Kontakt
            </h3>
            <div className="text-[15px] space-y-2">
              <p>
                <strong className="text-white">Tel.:</strong>{" "}
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="hover:text-[#F3A300] transition-colors"
                  itemProp="telephone"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </p>
              <p>
                <strong className="text-white">E-Mail:</strong>{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="hover:text-[#F3A300] transition-colors"
                  itemProp="email"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </div>

          {/* Mehr Infos */}
          <div>
            <h3
              className="text-white text-[28px] font-extrabold mb-5"
              style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif", textTransform: "uppercase" }}
            >
              Mehr Infos
            </h3>
            <ul className="text-[14px] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {footerLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="hover:text-[#F3A300] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Du hast Fragen? */}
          <div>
            <h3
              className="text-white text-[28px] font-extrabold mb-5"
              style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif", textTransform: "uppercase" }}
            >
              Du hast Fragen?
            </h3>
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="inline-block text-[40px] font-extrabold text-[#F3A300] hover:text-[#d99200] transition-colors leading-tight"
              style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif" }}
            >
              01579/2495836
            </a>
            <GoogleReviewsBadge data={reviewSummary} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ background: "rgba(0, 0, 0, 0.49)" }}>
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px] text-white/80">
          <p>&copy;{currentYear} Copyright - Knipserl.de</p>
          <nav className="flex gap-5" aria-label="Rechtliches">
            {legalLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="hover:text-[#F3A300] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
