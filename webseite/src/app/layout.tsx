import type { Metadata } from "next";
import { Fira_Sans, Fira_Sans_Extra_Condensed } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { generateLocalBusinessSchema, generateServiceSchema } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCondensed = Fira_Sans_Extra_Condensed({
  variable: "--font-fira-condensed",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

// SITE_ENV is a runtime variable (no NEXT_PUBLIC_ prefix → works at runtime)
// Set to "staging" in docker-compose for dev environments
const isProduction = process.env.SITE_ENV !== "staging";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Fotobox mieten | ${SITE_NAME} | Rosenheim, München & Oberbayern`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Professionelle Fotobox mit Sofortdruck mieten ab 379€. Inklusive Auf- & Abbau, Druckflatrate und 24/7 Support. Für Hochzeit, Firmenfeier und Party in Oberbayern und Tirol.",
  keywords: [
    "Fotobox mieten",
    "Fotobox Rosenheim",
    "Fotobox München",
    "Fotobox Hochzeit",
    "Fotobox Firmenfeier",
    "Photobooth mieten",
    "Fotobox mit Drucker",
    "Fotobox Oberbayern",
  ],
  authors: [{ name: "Knipserl Fotobox" }],
  creator: "Knipserl Fotobox",
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `Fotobox mieten | ${SITE_NAME}`,
    description:
      "Professionelle Fotobox mit Sofortdruck mieten ab 379€. Inklusive Auf- & Abbau, Druckflatrate und 24/7 Support.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630 }],
  },
  robots: isProduction
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = generateLocalBusinessSchema();
  const serviceSchema = generateServiceSchema();

  return (
    <html lang="de" className={`${firaSans.variable} ${firaCondensed.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
