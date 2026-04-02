export const SITE_NAME = "Knipserl Fotobox";
export const SITE_URL = "https://www.knipserl.de";
export const SITE_TAGLINE = "Fotobox für Oberbayern und Tirol";
export const CONTACT_EMAIL = "info@knipserl.de";
export const CONTACT_PHONE = "+4915792495836";
export const CONTACT_PHONE_DISPLAY = "01579 / 2495836";
export const WHATSAPP_URL = "https://wa.me/4915792495836";

export const ADDRESS = {
  name: "Knipserl Fotobox",
  owner: "Andreas Huber",
  street: "Tulpenstraße 13",
  zip: "83052",
  city: "Bruckmühl",
  country: "DE",
  lat: 47.8833,
  lng: 12.0833,
};

export const BASE_PRICE = 379;

export const ADDONS: {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  link?: string;
}[] = [
  {
    id: "requisiten",
    name: "Requisiten",
    price: 45,
    description:
      "Wir stellen Dir ein umfangreiches Set an Requisiten für Deine Gäste zur Verfügung.",
    image: "/images/addons/requisiten.png",
  },
  {
    id: "gaestetelefon",
    name: "Gästetelefon / Audio Gästebuch",
    price: 100,
    description:
      "Eure Gäste können auf unserem urigen Gästetelefon Sprachnachrichten hinterlassen. Diese werden Euch nach dem Event zugesandt.",
    image: "/images/addons/gaestetelefon.png",
    link: "/audio-gaestebuch",
  },
  {
    id: "online-funktionen",
    name: "Online Funktionen",
    price: 50,
    description:
      "Eure Gäste können sich Ihre geschossenen Fotos ganz einfach per SMS, E-Mail oder QR-Code direkt auf das Handy senden.",
    image: "/images/addons/online-funktionen.png",
  },
  {
    id: "live-slideshow",
    name: "Live Slideshow mit 50 Zoll TV",
    price: 150,
    description:
      "Wir stellen euch einen TV inkl. Ständer zur Verfügung. Darauf wird eine Live-Slideshow mit den Fotos angezeigt.",
    image: "/images/addons/live-slideshow.png",
  },
  {
    id: "usb-stick",
    name: "Alle Bilder auf USB Stick",
    price: 20,
    description:
      "Du erhältst 3 Werktage nach deiner Feier einen urigen Holz-USB-Stick im Knipserl Design.",
    image: "/images/addons/usb-stick.png",
  },
  {
    id: "gaestebuch",
    name: "Gästebuch inkl. Stifte & Pads",
    price: 30,
    description:
      "Eure Gäste haben die Möglichkeit die ausgedruckten Fotos in euer Gästebuch einzukleben und mit einer persönlichen Nachricht zu versehen.",
    image: "/images/addons/gaestebuch.png",
  },
  {
    id: "love-buchstaben",
    name: "XXL LOVE Buchstaben",
    price: 150,
    description:
      '120cm hoch, beleuchtet und wasserdicht - Perfekt für eure Hochzeit!',
    image: "/images/addons/love-buchstaben.jpg",
    link: "/love-buchstaben",
  },
  {
    id: "hintergrundsystem",
    name: "Hintergrundsystem 2,45 x 2,45m",
    price: 50,
    description:
      "Unser Fotobox-Hintergrund hat eine Größe von 2,45 x 2,45 Metern. Ihr könnt zwischen 3 verschiedenen Motiven wählen.",
    image: "/images/addons/hintergrundsystem.jpg",
  },
];

// Distance tiers from Rosenheim (in km) -> price in EUR
// 0-15km is free (included in base price)
export const DISTANCE_TIERS = [
  { maxKm: 15, price: 0 },
  { maxKm: 20, price: 30 },
  { maxKm: 30, price: 50 },
  { maxKm: 40, price: 70 },
  { maxKm: 50, price: 90 },
  { maxKm: 60, price: 110 },
  { maxKm: 70, price: 130 },
  { maxKm: 80, price: 150 },
  { maxKm: 90, price: 170 },
  { maxKm: 100, price: 200 },
  { maxKm: 110, price: 210 },
  { maxKm: 120, price: 240 },
  { maxKm: Infinity, price: 260 },
] as const;

export const ORIGIN_ADDRESS = "Rosenheim, Deutschland";
export const MAX_DELIVERY_KM = 120;

export const BASE_FEATURES = [
  "Kostenloser Auf- & Abbau (40 km inklusive ab Rosenheim)",
  "Druckflatrate (400 Bilder) in 10x15 cm",
  "Inklusive Profi-Thermosublimationsdrucker",
  "Hochwertige Spiegelreflexkamera",
  "Riesiger Touchscreen (22 Zoll!)",
  "Studioblitz mit Softbox",
  "Online-Galerie mit Passwortschutz",
  "Alle Bilder per Download (innerhalb 3 Werktage)",
  "Individuelles Design der Ausdrucke",
  "24/7 Telefonsupport",
];

export const EVENT_TYPES = ["Hochzeit", "Geburtstag", "Firmenevent"] as const;

export const SEO_CITIES = [
  {
    slug: "rosenheim",
    name: "Rosenheim",
    region: "Oberbayern",
    description:
      "Miete jetzt die Knipserl Fotobox in Rosenheim und Umgebung. Professionelle Fotobox mit Sofortdruck für Hochzeit, Firmenfeier und Party.",
    nearbyAreas: [
      "Kolbermoor",
      "Bad Aibling",
      "Bruckmühl",
      "Stephanskirchen",
      "Raubling",
      "Prien am Chiemsee",
    ],
  },
  {
    slug: "muenchen",
    name: "München",
    region: "Oberbayern",
    description:
      "Fotobox mieten in München – Knipserl liefert die Fotobox mit Drucker direkt zu Deiner Location in München und Umgebung.",
    nearbyAreas: [
      "Unterhaching",
      "Ottobrunn",
      "Haar",
      "Unterschleißheim",
      "Garching",
      "Freising",
    ],
  },
  {
    slug: "ebersberg",
    name: "Ebersberg",
    region: "Oberbayern",
    description:
      "Fotobox mieten im Landkreis Ebersberg – Mit Sofortdruck und professioneller Ausstattung für Hochzeit und Firmenfeier.",
    nearbyAreas: [
      "Grafing",
      "Markt Schwaben",
      "Vaterstetten",
      "Kirchseeon",
      "Poing",
    ],
  },
  {
    slug: "miesbach",
    name: "Miesbach",
    region: "Oberbayern",
    description:
      "Fotobox für den Landkreis Miesbach mieten – Perfekt für Events in Miesbach, Tegernsee und Schliersee.",
    nearbyAreas: [
      "Tegernsee",
      "Schliersee",
      "Holzkirchen",
      "Hausham",
      "Bad Wiessee",
    ],
  },
  {
    slug: "traunstein",
    name: "Traunstein",
    region: "Oberbayern",
    description:
      "Knipserl Fotobox für Traunstein und den Chiemgau. Professionelle Fotobox mit Drucker für Dein Event.",
    nearbyAreas: [
      "Siegsdorf",
      "Trostberg",
      "Ruhpolding",
      "Inzell",
      "Übersee",
    ],
  },
  {
    slug: "wasserburg",
    name: "Wasserburg am Inn",
    region: "Oberbayern",
    description:
      "Fotobox mieten in Wasserburg am Inn – Inklusive Auf- und Abbau, Druckflatrate und professioneller Kamera.",
    nearbyAreas: ["Edling", "Eiselfing", "Babensham", "Amerang"],
  },
  {
    slug: "muehldorf",
    name: "Mühldorf am Inn",
    region: "Oberbayern",
    description:
      "Fotobox für Mühldorf am Inn und Umgebung mieten. Professionelle Fotobox mit Sofortdruck von Knipserl.",
    nearbyAreas: ["Waldkraiburg", "Ampfing", "Neumarkt-Sankt Veit", "Polling"],
  },
  {
    slug: "erding",
    name: "Erding",
    region: "Oberbayern",
    description:
      "Fotobox mieten in Erding – Für Hochzeiten, Firmenfeiern und private Partys mit Sofortdruck.",
    nearbyAreas: ["Dorfen", "Taufkirchen", "Wartenberg", "Isen"],
  },
  {
    slug: "kufstein",
    name: "Kufstein",
    region: "Tirol",
    description:
      "Fotobox mieten in Kufstein und Tirol – Knipserl liefert auch nach Österreich! Mit Drucker und komplettem Service.",
    nearbyAreas: ["Wörgl", "Söll", "Kiefersfelden", "Ebbs", "Ellmau"],
  },
] as const;

export type CitySlug = (typeof SEO_CITIES)[number]["slug"];
