import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, ADDRESS, CONTACT_PHONE, CONTACT_EMAIL } from "./constants";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export function generatePageMetadata({ title, description, path, image }: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/images/og-default.jpg`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: "de_DE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description:
      "Professionelle Fotobox mit Sofortdruck mieten in Oberbayern und Tirol. Inklusive Auf- und Abbau, Druckpaket und 24/7 Support.",
    url: SITE_URL,
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    image: `${SITE_URL}/images/logo/knipserl-logo.png`,
    logo: `${SITE_URL}/images/logo/knipserl-logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.city,
      postalCode: ADDRESS.zip,
      addressCountry: ADDRESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ADDRESS.lat,
      longitude: ADDRESS.lng,
    },
    areaServed: [
      { "@type": "City", name: "Rosenheim" },
      { "@type": "City", name: "München" },
      { "@type": "City", name: "Ebersberg" },
      { "@type": "City", name: "Miesbach" },
      { "@type": "City", name: "Traunstein" },
      { "@type": "City", name: "Wasserburg am Inn" },
      { "@type": "City", name: "Mühldorf am Inn" },
      { "@type": "City", name: "Erding" },
      { "@type": "City", name: "Kufstein" },
    ],
    priceRange: "€€",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
  };
}

export function generateServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Fotobox mieten",
    provider: {
      "@type": "LocalBusiness",
      name: SITE_NAME,
    },
    serviceType: "Fotobox Verleih",
    description:
      "Professionelle Fotobox mit Sofortdruck, Spiegelreflexkamera und 22 Zoll Touchscreen. Inklusive Auf- und Abbau.",
    offers: {
      "@type": "Offer",
      price: "379",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 47.8571,
        longitude: 12.1181,
      },
      geoRadius: "120000",
    },
  };
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
