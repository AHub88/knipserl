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
    id: "usb-stick",
    name: "Alle Bilder auf USB Stick",
    price: 20,
    description:
      "Du erhältst 3 Werktage nach deiner Feier einen urigen Holz-USB-Stick im Knipserl Design.",
    image: "/images/addons/usb-stick.png",
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
    id: "gaestebuch",
    name: "Gästebuch inkl. Stifte & Pads",
    price: 30,
    description:
      "Eure Gäste haben die Möglichkeit die ausgedruckten Fotos in euer Gästebuch einzukleben und mit einer persönlichen Nachricht zu versehen.",
    image: "/images/addons/gaestebuch.png",
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
    id: "love-buchstaben",
    name: "XXL LOVE Buchstaben",
    price: 150,
    description:
      '120cm hoch, beleuchtet und wasserdicht - Perfekt für eure Hochzeit!',
    image: "/images/addons/love-buchstaben.jpg",
    link: "/love-buchstaben",
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
    landkreis: "Landkreis Rosenheim",
    lat: 47.8571,
    lng: 12.1181,
    distanceFromRosenheim: 0,
    nearbyAreas: ["Kolbermoor", "Bad Aibling", "Bruckmühl", "Stephanskirchen", "Raubling", "Prien am Chiemsee"],
    seoTitle: "Fotobox Rosenheim mieten — ab 379 € | Drucker & Lieferung inkl.",
    description:
      "Knipserl-Fotobox direkt aus Rosenheim. Inkl. Profi-Drucker, Auf-/Abbau und Druckflatrate für Hochzeit, Firmenfeier und Geburtstag. Lieferung im Stadtgebiet kostenlos.",
    heroTeaser: "Deine Fotobox direkt aus Rosenheim",
    heroP1:
      "Die Knipserl-Fotobox ist in Rosenheim zu Hause — und damit Deine kürzeste Strecke zu echten gedruckten Erinnerungen, wenn Du für Hochzeit, Firmenfeier oder Geburtstag einen verlässlichen Partner suchst. Von der Ku'Ko über den Lokschuppen bis zu den Wirtshäusern rund um den Max-Josefs-Platz kennen wir die Locations persönlich — inklusive der Fragen nach Stromanschluss und Stellplatz, die Du sonst selbst klären müsstest.",
    heroP2:
      "Weil wir direkt aus dem Landkreis kommen, sind Fahrtkosten in Rosenheim und dem 15-km-Umkreis inklusive. Die Fotobox kombiniert eine Profi-Spiegelreflexkamera mit einem Thermosublimationsdrucker, der Fotoabzüge in 10×15 cm innerhalb weniger Sekunden ausgibt — wischfest und hochglänzend. Wir liefern nach Kolbermoor, Bad Aibling, Bruckmühl, Stephanskirchen, Raubling und Prien am Chiemsee — und alles dazwischen.",
    momenteP1:
      "In Rosenheim haben wir über die Jahre gesehen, was eine Fotobox mit Hochzeitsgästen macht: Die Schlange bildet sich nach dem Hauptgang, bleibt bis in die Nacht bestehen und reißt erst ab, wenn die letzte Band-Zugabe läuft. Das Knipserl ist kein Extra — es wird zum Mittelpunkt der Feier.",
    momenteP2:
      "Besonders schön sind die Bilder, die Du gar nicht geplant hast: Opa und Enkel hinter der gleichen Sonnenbrille, Trauzeugen in Papp-Schnauzbärten, die Braut mit dem Cowboyhut eines Gastes. Diese Fotos erzählen später die Geschichte der Nacht besser als jedes offizielle Hochzeitsfoto.",
    bedienungP1:
      "Kein Gast muss vor der Knipserl-Fotobox lange überlegen. Ein Tippen auf den 22-Zoll-Touchscreen startet den Countdown, die DSLR blitzt, der Drucker arbeitet — und der Fotostreifen liegt in wenigen Sekunden in der Hand. So einfach wie früher der Automat am Bahnhof, aber mit Studiobeleuchtung und HD-Auflösung.",
    bedienungP2:
      "Drei, vier Filter stehen zur Wahl — Schwarz-Weiß, Sepia, Retro, Farbe. Mehr braucht niemand. Wir haben die Box in den letzten Jahren so oft in Rosenheim und Umgebung aufgestellt, dass wir die Bedienung auf jeden Handgriff optimiert haben: ein Knopf, ein Foto, fertig.",
    fotopropsP1:
      "Unser Koffer mit Fotoprops ist immer dabei. Hüte, Brillen, Pappschilder, ein paar Kostüm-Accessoires — das Standard-Set reicht für Hochzeiten und Firmenevents aller Größen. Wer in Rosenheim einen bestimmten Stil sucht (trachtig, retro, Business-angemessen), sagt vorher Bescheid, dann packen wir passend.",
    fotopropsP2:
      "Zwischen den Events werden alle Props desinfiziert. Funktioniert auch dann noch, wenn die 30. Gruppenpose versucht wird: Das Material ist stabil genug, um eine Hochzeit mit 150 Gästen zu überstehen — und die darauffolgende Firmenfeier gleich mit.",
    qualitaetP1:
      "Den Auf- und Abbau der Knipserl in Rosenheim übernehmen wir. Du brauchst einen Quadratmeter Stellfläche, eine Steckdose — wir erledigen den Rest in etwa 20 Minuten. Auch in Räumen, die auf dem Plan zu klein oder zu dunkel wirken, finden wir praktisch immer einen Platz, der passt.",
    qualitaetP2:
      "Die Technik ist das Zuverlässigste am ganzen Setup: aktuelle DSLR, Studioblitz mit Softbox, Thermosublimationsdrucker (kein Tinten-Geschmiere, keine verblassenden Farben), Full-HD-Touchscreen. 400 Fotoabzüge sind in jedem Paket enthalten — für die meisten Feiern in Rosenheim mehr als genug.",
    localTitle: "Fotobox-Einsätze in Rosenheim und im Landkreis",
    localP1:
      "Rosenheim ist unser Heimspiel — entsprechend oft sind wir hier unterwegs. Typische Einsätze: Hochzeiten im Ku'Ko, Firmen-Weihnachtsfeiern im Lokschuppen, private Geburtstage in Gasthäusern rund um den Max-Josefs-Platz, Jubiläen in Vereinsheimen von Kolbermoor bis Raubling. Was die meisten Locations in Rosenheim gemeinsam haben: Platz ist da, Strom auch, und die Stimmung kommt von selbst.",
    localP2:
      "Weil wir aus Bruckmühl kommen und seit Jahren im Landkreis unterwegs sind, kennen wir die meisten Veranstaltungsorte persönlich oder haben Kollegen, die sie kennen. Sag uns im Anfrageformular einfach die Location — wir melden uns innerhalb weniger Stunden mit einer Rückfrage oder direkt mit dem Angebot. Kurze Wege, lokales Team, kein Anfahrtszuschlag innerhalb des Stadtgebiets.",
    faqs: [
      {
        question: "Wie lange im Voraus sollte ich die Fotobox für Rosenheim buchen?",
        answer:
          "Für Hochzeits-Samstage zwischen Mai und September empfehlen wir 4–6 Monate Vorlauf. Wochentage, Winterzeit und Firmenevents sind meistens auch kurzfristiger verfügbar — stell Deine Anfrage, wir melden uns innerhalb von 24 Stunden mit einer Verfügbarkeitsauskunft.",
      },
      {
        question: "Fallen innerhalb von Rosenheim Anfahrtskosten an?",
        answer:
          "Nein. Die Stadt Rosenheim und ein Radius von 15 km sind im Basispaket enthalten — darunter Kolbermoor, Raubling und Stephanskirchen. Für größere Distanzen greift unsere Kilometer-Staffel, die Du im Preiskonfigurator direkt einsehen kannst.",
      },
      {
        question: "Kann das Drucklayout individuell angepasst werden?",
        answer:
          "Ja, das Drucklayout (Rahmen, Logo, Event-Titel, Datum) passen wir kostenlos für Dich an. Hochzeitsdesigns, Firmenlogos, Geburtstagsmotive — schick uns einfach Deine Vorgaben, wir setzen das Layout für Dich auf.",
      },
    ],
  },
  {
    slug: "muenchen",
    name: "München",
    region: "Oberbayern",
    landkreis: "Landeshauptstadt München",
    lat: 48.1351,
    lng: 11.5820,
    distanceFromRosenheim: 65,
    nearbyAreas: ["Unterhaching", "Ottobrunn", "Haar", "Unterschleißheim", "Garching", "Freising"],
    seoTitle: "Fotobox München mieten — Hochzeit & Firmenfeier ab 379 €",
    description:
      "Fotobox in München mieten — inkl. Profi-Drucker, Auf-/Abbau und Druckflatrate. Lieferung direkt zur Location in Schwabing, Maxvorstadt, Bogenhausen und ins Umland.",
    heroTeaser: "Eure Fotobox für Münchens Events",
    heroP1:
      "München ist kein Dorf — und Eure Hochzeit, Firmenfeier oder Jubiläumsfeier ist selten eine kleine Sache. Die Knipserl-Fotobox liefert für die Landeshauptstadt genau das, was München-Events brauchen: einen Profi-Aufbau, der im Postpalast genauso funktioniert wie im Alten Bayerischen Landtag, in Schwabinger Privaträumen oder auf einer Hochzeit im Schlosshotel. Gedruckte Erinnerungen, die Eure Gäste noch am selben Abend in der Hand halten.",
    heroP2:
      "Wir liefern in alle Münchner Stadtviertel — von Altstadt und Maxvorstadt über Bogenhausen und Pasing bis in die Umlandgemeinden Unterhaching, Ottobrunn, Haar, Unterschleißheim, Garching und Freising. Die Fotobox selbst ist ein technisches Komplettpaket aus Spiegelreflexkamera, Studioblitz und Thermodrucker — alles, was Ihr für hochwertige Ausdrucke braucht, ohne dass sich jemand auf der Feier um Technik kümmern muss.",
    momenteP1:
      "Münchner Feiern ziehen gerne länger. Wenn nach der zweiten Runde der Gast, der bisher still auf dem Stuhl saß, plötzlich mit dem Chef hinter der Fotobox verschwindet, weißt Du: Die Box hat ihren Zweck erfüllt. Sie bricht die gewohnten Gruppen auf und sorgt für Bilder, die später in WhatsApp-Gruppen und Büroflur-Pinnwänden landen.",
    momenteP2:
      "Gerade bei großen Hochzeiten in München, mit 150+ Gästen, wird die Fotobox zum zweiten Treffpunkt neben der Bar. Die Ausdrucke sammeln sich oft im Gästebuch der Brautpaare, aus dem so das persönlichste Hochzeitsalbum wird, das man sich vorstellen kann — ohne dass jemand es aktiv geplant hätte.",
    bedienungP1:
      "In der Großstadt haben Gäste oft wenig Geduld für Technik. Deshalb ist die Knipserl-Fotobox so konzipiert, dass sie ohne Erklärung funktioniert: Touchscreen antippen, Countdown läuft, Foto wird geschossen, Druck kommt raus. Der 22-Zoll-Bildschirm erklärt jeden Schritt selbst — keine Bedienungsanleitung, kein Personal, keine Wartezeit.",
    bedienungP2:
      "Egal, ob es ein Münchner Firmen-Kickoff ist, eine Gala im MOC oder die Silberhochzeit in Freising: Die Oberfläche bleibt gleich einfach. Zwei, drei Filter stehen zur Auswahl — Farbe, Schwarz-Weiß, Retro. Mehr braucht niemand, und das ist so beabsichtigt.",
    fotopropsP1:
      "Unser Prop-Koffer ist auch für München-Events optimiert. Business-Brillen, elegantere Hüte und dezentere Accessoires für Firmenfeiern; klassische Hochzeits-Requisiten für private Events; Partyhüte und wilde Masken für Geburtstage. Einfach beim Anfragen sagen, um welche Art Event es geht — wir packen entsprechend.",
    fotopropsP2:
      "Die Accessoires reichen auch für 200-Personen-Events und werden zwischen den Buchungen konsequent desinfiziert. Für Münchner Messeauftritte, Unternehmensmessen oder Corporate Weihnachtsfeiern liefern wir auf Wunsch auch gebrandete Props mit.",
    qualitaetP1:
      "Der Aufbau erfolgt durch uns — egal, ob Ihr in einem Münchner Szene-Loft, einem Schlosshotel am Starnberger See oder einer Industriehalle in Garching feiert. Wir brauchen einen Quadratmeter, einen Stromanschluss und etwa 20 Minuten. Platz ist in München manchmal knapp, aber das Gehäuse ist kompakt genug, um auch in engen Räumen einen guten Platz zu finden.",
    qualitaetP2:
      "Technisch gibt es keine Kompromisse: DSLR mit 24-MP-Sensor, Studioblitz mit Softbox, High-End-Thermosublimationsdrucker, robuster Touchscreen. Die Ausdrucke sind 10×15 cm Hochglanz, wisch- und wasserfest. 400 Bilder sind im Paket — für eine Hochzeit mit 120 Gästen reicht das in den allermeisten Fällen.",
    localTitle: "Fotobox-Einsätze in München und dem Münchner Umland",
    localP1:
      "München bedeutet Vielfalt: Wir stellen die Fotobox in historischen Hochzeitssälen wie dem Künstlerhaus am Lenbachplatz genauso auf wie in modernen Co-Working-Lofts, in Bogenhausener Privatwohnungen oder auf Firmenfeiern im MOC. Jedes Viertel hat seine eigenen Veranstaltungsorte — und wir kennen die meisten davon entweder persönlich oder aus Kollegen-Empfehlungen.",
    localP2:
      "Für Münchner Firmenevents sind wir häufig gebucht für Kickoffs, Sommerfeste und Weihnachtsfeiern — gerade, weil wir das Drucklayout auf Wunsch an Corporate Design anpassen und die Box dezent in jeden Raum integrieren. Im Umland — Unterhaching, Ottobrunn, Haar, Unterschleißheim, Garching und Freising — liefern wir regelmäßig zu Hochzeiten in Gasthäusern und Schlosshotels.",
    faqs: [
      {
        question: "Liefert Ihr auch mitten in die Münchner Altstadt?",
        answer:
          "Ja. Wir bringen die Fotobox in jedes Münchner Stadtviertel — Altstadt, Maxvorstadt, Haidhausen, Bogenhausen, Schwabing, Pasing etc. Gib bei der Anfrage einfach die Event-Adresse mit an, dann prüfen wir die Anlieferung (manche Innenstadtlocations haben enge Ladezonen, wir klären das mit Dir ab).",
      },
      {
        question: "Was kostet die Lieferung nach München?",
        answer:
          "Die Fahrtkosten aus unserem Basisstandort ins Münchner Stadtgebiet liegen je nach Zielort bei etwa 90–130 €. Der Preiskonfigurator berechnet Dir die genaue Summe inklusive Route — einfach Adresse eingeben und in Echtzeit sehen.",
      },
      {
        question: "Könnt Ihr die Fotobox für ein Firmenevent in München branden?",
        answer:
          "Ja. Wir passen das Drucklayout kostenlos an Euer Corporate Design an — Logo, Farben, Event-Titel, Datum. Für größere Firmenfeiern in München ist das fast immer Standard.",
      },
    ],
  },
  {
    slug: "ebersberg",
    name: "Ebersberg",
    region: "Oberbayern",
    landkreis: "Landkreis Ebersberg",
    lat: 48.0767,
    lng: 11.9716,
    distanceFromRosenheim: 50,
    nearbyAreas: ["Grafing", "Markt Schwaben", "Vaterstetten", "Kirchseeon", "Poing"],
    seoTitle: "Fotobox Ebersberg mieten — ab 379 € inkl. Drucker & Aufbau",
    description:
      "Fotobox mieten im Landkreis Ebersberg — Grafing, Markt Schwaben, Vaterstetten, Poing. Inkl. Drucker, Druckflatrate und Aufbau. Sofortdruck-Fotos für Deine Feier.",
    heroTeaser: "Fotobox für den Landkreis Ebersberg",
    heroP1:
      "Zwischen Münchner Ostrand und Chiemgau-Vorland liegt der Landkreis Ebersberg — und genau dorthin bringen wir die Knipserl-Fotobox. Ob Du in Ebersberg selbst, in Grafing, Markt Schwaben, Vaterstetten oder Kirchseeon feierst: Die Fotobox macht aus jedem Raum für eine Nacht einen kleinen Fotoautomat, der Deinen Gästen gedruckte Erinnerungen direkt in die Hand gibt.",
    heroP2:
      "Der Landkreis hat zwei Gesichter: Richtung München dichter besiedelt und S-Bahn-nah, Richtung Osten ländlicher mit Höfen und Wirtshäusern. Beide Welten gehören zu unseren Standardrouten. Wir liefern zu Hochzeitslocations, Firmenräumen, Vereinsheimen und privaten Feiern genauso zuverlässig wie in Rosenheim. Die Fotobox kommt mit Profi-Drucker, DSLR-Kamera und Studioblitz — fertig aufgebaut, sobald die Feier losgeht.",
    momenteP1:
      "Vielleicht das Ebersberger Phänomen: Eine Fotobox im Festsaal oder Dorfgasthof verwandelt auch den schüchternsten Nachbarn in einen spontanen Posen-Künstler. Nach dem zweiten Getränk stehen vor der Box plötzlich Gäste, die Du sonst kaum am Tisch erlebst.",
    momenteP2:
      "Eltern schleppen die Kinder zur Box, Paare machen ihr erstes gemeinsames Foto des Abends, Trauzeugen basteln sich ein komplettes Album allein. Am Ende des Abends liegen die Fotostreifen in Körben, auf Tischen, in Taschen — und mindestens einer davon landet im Rahmen über der Kommode.",
    bedienungP1:
      "Die Fotobox braucht keine Anleitung. Touchscreen antippen, Countdown läuft, Kamera blitzt, Drucker arbeitet — Fotostreifen in der Hand. Das ist alles, was Deine Gäste wissen müssen. Auch das Gastfamilienmitglied, das sonst mit Smartphones fremdelt, bedient das Ding ohne Zögern.",
    bedienungP2:
      "Die Logik dahinter ist bewusst schlicht: zwei, drei Filter (Farbe, Schwarz-Weiß, Retro), ein klarer Druck-Knopf, eine Vorschau. Keine Menüs, keine Konten, keine Downloads. Wer das digitale Foto später möchte, bekommt es über die Online-Galerie mit Passwortschutz.",
    fotopropsP1:
      "Ein Koffer voll Requisiten liegt bei jedem Event auf dem Nebentisch: Hüte, Brillen, Papp-Schilder, ein paar größere Stücke. Für Ebersberger Hochzeiten und Firmenfeiern reicht das Standard-Set bestens. Sag uns vorab Bescheid, wenn Du ein bestimmtes Motto feierst — Country, Tracht, 70er, Business — dann stimmen wir den Inhalt darauf ab.",
    fotopropsP2:
      "Die Props werden zwischen den Events gereinigt und sind stabil genug für eine Feier mit 150 Gästen. Auch mit Kindern am Event funktioniert das Set zuverlässig — die meisten Stücke sind bruchsicher gebaut, weil wir auch Familienfeiern regelmäßig ausstatten.",
    qualitaetP1:
      "Auf- und Abbau erledigen wir — und zwar so, dass Du davon nichts mitbekommst, wenn Du gerade Deine Gäste begrüßt. Ein Quadratmeter Stellfläche, eine Steckdose und 20 Minuten — fertig. Wir kommen rechtzeitig vor dem Event und holen erst wieder ab, wenn die letzten Gäste gegangen sind.",
    qualitaetP2:
      "Technik, die auch im Ernstfall trägt: Spiegelreflexkamera mit hochauflösendem Sensor, Softbox-Blitzanlage für ausgeglichene Belichtung bei jedem Licht, High-End-Thermosublimationsdrucker. Die Fotostreifen sind hochglänzend und wischfest. 400 Stück sind im Paket — für Feiern bis ca. 120 Gäste reicht das bequem.",
    localTitle: "Fotobox-Einsätze im Landkreis Ebersberg",
    localP1:
      "Der Landkreis Ebersberg ist für uns eine Standardroute — wir liefern regelmäßig zu Hochzeiten in Grafing, zu Familienfeiern in Kirchseeon und Poing, zu Firmenevents von Pendler-Betrieben in Vaterstetten und Markt Schwaben. Viele Kunden hier entscheiden sich für das Knipserl, weil die S-Bahn-Anbindung an München da ist, aber der ländliche Charakter der Feierlocations erhalten bleibt.",
    localP2:
      "Typisch für Ebersberger Events: Gasthöfe mit Saal, Bauernhof-Locations rund um Grafing, moderne Vereinsräume in Poing, Hochzeitsscheunen rund um den Ebersberger Forst. Wir passen den Aufbau an jeden Raumtyp an — die Fotobox steht genauso zuverlässig in einer 200-Jahre-alten Stube wie in einem frisch renovierten Saal.",
    faqs: [
      {
        question: "Was kostet die Anfahrt nach Ebersberg?",
        answer:
          "Die Fahrtkosten ab unserem Standort zum Landkreis Ebersberg liegen je nach Zielort bei ca. 70–100 €. Der Preiskonfigurator zeigt Dir die exakte Summe, wenn Du Deine Adresse eingibst.",
      },
      {
        question: "Liefert Ihr auch nach Poing, Vaterstetten oder Grafing?",
        answer:
          "Ja, regelmäßig. Alle Orte im Landkreis Ebersberg stehen auf unserer Standardroute. Auch S-Bahn-nahe Gemeinden wie Markt Schwaben und Kirchseeon beliefern wir ohne besonderen Aufpreis.",
      },
      {
        question: "Kann ich die Fotobox auch für eine kleine Feier mit 30 Gästen buchen?",
        answer:
          "Ja, der Preis bleibt gleich — Du buchst die Fotobox, nicht die Gästezahl. Gerade bei kleineren Hochzeiten und Geburtstagen in Ebersberger Gasthöfen kommt die Box besonders oft zum Einsatz, weil sie als Unterhaltungselement auch wenige Gäste in Schwung bringt.",
      },
    ],
  },
  {
    slug: "miesbach",
    name: "Miesbach",
    region: "Oberbayern",
    landkreis: "Landkreis Miesbach",
    lat: 47.7908,
    lng: 11.8312,
    distanceFromRosenheim: 35,
    nearbyAreas: ["Tegernsee", "Schliersee", "Holzkirchen", "Hausham", "Bad Wiessee"],
    seoTitle: "Fotobox Miesbach mieten — am Tegernsee & Schliersee ab 379 €",
    description:
      "Fotobox für Miesbach, Tegernsee, Schliersee und Bad Wiessee mieten. Profi-Drucker, Druckflatrate und Aufbau inkl. Perfekt für alpine Hochzeitslocations.",
    heroTeaser: "Eure Fotobox für Miesbach und das Tegernseer Tal",
    heroP1:
      "Der Landkreis Miesbach ist Hochzeitsland. Luxuriöse Seehotels am Tegernsee, traditionsreiche Gasthöfe am Schliersee, private Bauernhöfe mit Blick auf Wallberg und Wendelstein — kaum eine Region in Oberbayern hat dichter besiedelte Premium-Locations auf kleinem Raum. Genau hierher liefert die Knipserl-Fotobox Sofortdruck-Erinnerungen, die Deine Gäste nach der Feier mit nach Hause nehmen.",
    heroP2:
      "Wir liefern nach Miesbach selbst sowie nach Tegernsee, Schliersee, Holzkirchen, Hausham und Bad Wiessee — die Fotobox mit Profi-Spiegelreflexkamera, Studioblitz und Thermosublimationsdrucker ist auf die hohen Ansprüche der Region abgestimmt. Du bekommst gedruckte Fotoabzüge in 10×15 cm Hochglanz, die auch dem standesamtlichen Niveau einer Tegernseer Hochzeit gerecht werden.",
    momenteP1:
      "Am Tegernsee sehen wir häufig das gleiche Muster: Die Hochzeitsgäste stehen nach dem Essen auf der Terrasse, die Musik spielt drinnen, und irgendwann merken alle, dass die Schönheit der Kulisse unbedingt ein Foto braucht. Die Knipserl-Fotobox liefert genau das — Erinnerungen, die nicht auf einem Handy versacken, sondern in der Hand liegen.",
    momenteP2:
      "In Miesbacher Festsälen sehen wir oft die eleganteren Motive: Trachtenhochzeiten mit Miesbacher Gwand, Firmenfeiern in dezent bayerischem Rahmen, Geburtstage mit Blick auf die Bergkulisse. Die Box verwandelt diese Momente in kleine Ausdrucke, die Gäste zwischen die Seiten des Gästebuchs kleben.",
    bedienungP1:
      "Keine Lernkurve, kein Personal, kein Ärger: Ein Touch, ein Countdown, ein Blitz, ein Ausdruck. Das Prinzip ist so einfach, dass es Gäste auch nach mehreren Gläsern Wein aus dem Tegernseer Tal problemlos bedienen können. Der 22-Zoll-Touchscreen zeigt jeden Schritt an.",
    bedienungP2:
      "Drei Filter stehen zur Wahl — Farbe, Schwarz-Weiß, Retro. Das ist bewusst knapp gehalten: Niemand muss entscheiden, ob das Foto 'vintage-warm' oder 'vintage-kühl' sein soll. Der Druck ist fertig, bevor der nächste Gast sich überlegt, welche Pose er als Nächstes will.",
    fotopropsP1:
      "Für Miesbacher Events stimmen wir den Prop-Koffer auf Wunsch etwas dezenter ab: elegantere Brillen und Hüte, Trachten-passende Accessoires, Papp-Schilder für Hochzeiten. Sag uns vorab den Charakter der Feier — trachtig, klassisch, festlich — wir bringen passendes Zubehör.",
    fotopropsP2:
      "Die Requisiten sind stabil und werden zwischen Events desinfiziert. Auch mit Kindern funktionieren die meisten Stücke problemlos. Wer eigene Props mitbringen möchte, darf das natürlich — die Fotobox fotografiert, was immer vor sie tritt.",
    qualitaetP1:
      "Im Tegernseer Tal und rund um Miesbach gibt es Locations mit anspruchsvoller Akustik und Ästhetik — hier wollen wir nicht stören. Der Aufbau ist kompakt, die Box optisch zurückhaltend, der Stromverbrauch gering. 20 Minuten Vorlaufzeit, ein Quadratmeter Stellfläche, eine Steckdose reichen.",
    qualitaetP2:
      "Die Technik ist für Premium-Anspruch ausgelegt: aktuelle Spiegelreflexkamera, Studio-Softbox für ausgeglichene Belichtung auch unter warmem Raumlicht, Thermosublimationsdrucker, der hochglänzende Abzüge in 10×15 cm produziert. Wisch- und wasserfest, in einem Format, das jeder kennt. 400 Ausdrucke pro Paket — bei einer Tegernseer Hochzeit mit 100 Gästen gut kalkuliert.",
    localTitle: "Fotobox-Einsätze in Miesbach, am Tegernsee und Schliersee",
    localP1:
      "Der Landkreis Miesbach ist Premium-Hochzeitsgebiet — rund um Tegernsee und Schliersee finden sich einige der gefragtesten Locations Süddeutschlands. Wir liefern regelmäßig zu Hochzeiten in traditionsreichen Seehotels, zu privaten Feiern auf Bauernhöfen bei Miesbach, zu Firmenevents in Holzkirchen und zu Jubiläen in Hausham. Die Fotobox fügt sich in beide Welten ein: elegant bei festlichen Anlässen, unkompliziert bei ländlichen Events.",
    localP2:
      "Was in Miesbach oft dazukommt: Trachtenhochzeiten. Wir haben unseren Prop-Koffer für solche Events angepasst, bieten gebrandete Drucklayouts in dezenter Optik an und wissen aus Erfahrung, dass auch Gäste im Dirndl gerne die Fotobox nutzen. Die Wege im Landkreis sind für uns kurz — aus Bruckmühl sind wir in rund 30 Minuten am Tegernsee.",
    faqs: [
      {
        question: "Liefert Ihr auch nach Bad Wiessee oder Rottach-Egern?",
        answer:
          "Ja, beide sind Standardroute für uns. Das Tegernseer Tal gehört zu den Gebieten, in die wir regelmäßig fahren. Die Fahrtkosten liegen je nach genauer Location zwischen 60 und 90 €.",
      },
      {
        question: "Passt die Fotobox auch in eine kleinere Hochzeitslocation am Schliersee?",
        answer:
          "Ja. Das Gehäuse ist kompakt (ca. 80×80 cm Grundfläche plus Stellraum für die Softbox), wir brauchen insgesamt einen Quadratmeter. Auch in Altbau-Sälen mit niedriger Decke und engen Türen passen wir problemlos durch.",
      },
      {
        question: "Gibt es ein Drucklayout, das zur bayerischen Hochzeit passt?",
        answer:
          "Ja — wir gestalten das Drucklayout kostenlos für Dich. Trachtige Designs mit Enzian, Edelweiß oder dezentem Karo-Muster sind gerade bei Miesbacher Hochzeiten häufig. Schick uns einfach Deine Vorstellung, wir setzen das Layout auf.",
      },
    ],
  },
  {
    slug: "traunstein",
    name: "Traunstein",
    region: "Oberbayern",
    landkreis: "Landkreis Traunstein",
    lat: 47.8683,
    lng: 12.6433,
    distanceFromRosenheim: 40,
    nearbyAreas: ["Siegsdorf", "Trostberg", "Ruhpolding", "Inzell", "Übersee"],
    seoTitle: "Fotobox Traunstein mieten — für Chiemgau-Events ab 379 €",
    description:
      "Fotobox für Traunstein, Chiemgau und Chiemsee mieten. Inkl. Drucker, Aufbau und Druckflatrate. Sofortdruck für Hochzeit, Firmenfeier und Jubiläum in der Region.",
    heroTeaser: "Fotobox für Traunstein und den Chiemgau",
    heroP1:
      "Der Chiemgau ist Feier-Region — und Traunstein mit seinen umliegenden Gemeinden einer der aktivsten Teile davon. Ob Hochzeit in einem Gasthof am Waginger See, Firmen-Sommerfest in Siegsdorf, Geburtstag in Ruhpolding oder Jubiläum in Trostberg: Die Knipserl-Fotobox bringt Sofortdruck-Fotos direkt zu Dir an die Location. Gedruckt wird im Moment, Deine Gäste nehmen Erinnerungen mit nach Hause.",
    heroP2:
      "Wir liefern in den gesamten Landkreis Traunstein — Siegsdorf, Trostberg, Ruhpolding, Inzell und Übersee gehören zu unseren regelmäßigen Zielen. Die Fotobox ist ein technisches Komplettpaket aus Profi-Spiegelreflexkamera, Studioblitz-Anlage und Thermosublimationsdrucker. Keine Kompromisse, kein Selbstaufbau, keine Tinten-Verschmierungen: Hochglanzfotos in 10×15 cm, direkt ausgedruckt.",
    momenteP1:
      "Der Chiemgau feiert gerne länger — und die Fotobox läuft die ganze Strecke mit. Was uns immer wieder auffällt: Die Gäste, die um 19 Uhr noch zurückhaltend sind, drehen um Mitternacht so richtig auf. Das ist der Moment, in dem die Fotobox von einem netten Extra zum Kernstück der Feier wird.",
    momenteP2:
      "In Traunsteiner Hochzeitssälen, Ruhpoldinger Vereinsheimen und privaten Bauernstuben funktioniert das gleiche Muster: Am Anfang eine Schlange aus Kindern und Teenagern, zur Primetime die eleganten Gäste, nach Mitternacht die Unermüdlichen. Jeder macht mindestens ein Foto — meistens deutlich mehr.",
    bedienungP1:
      "Die Knipserl-Fotobox ist so einfach bedienbar, dass sie auf einer Traunsteiner Landhochzeit mit gemischten Altersgruppen genauso funktioniert wie auf einer Firmenfeier in Trostberg mit überwiegend jüngerem Publikum. Ein Tippen, Countdown, Blitz, Druck — fertig. Der 22-Zoll-Touchscreen zeigt, was zu tun ist.",
    bedienungP2:
      "Drei Filter, eine Vorschau, ein Knopf zum Drucken. Nicht mehr. Wir haben die Bedienoberfläche in den letzten Jahren auf allen möglichen Events getestet — und jedes Mal kommen wir zum gleichen Ergebnis: Weniger Funktionen führen zu mehr Fotos, weil niemand das Gerät lange belegt.",
    fotopropsP1:
      "Für Chiemgau-Events sind unsere Fotoprops breit aufgestellt: Hüte, Brillen, Schilder, Trachten-Accessoires, klassische Partyelemente. Das Standard-Set reicht für 99 % aller Feiern. Falls Du besondere Vorstellungen hast (z. B. Ruhpoldinger Biathlon-Gäste mit Sport-Accessoires), sag Bescheid — wir packen passend.",
    fotopropsP2:
      "Die Props werden zwischen den Events gereinigt und sind stabil genug für 150-Personen-Feiern. Auf Wunsch können wir bei längerer Vorlaufzeit auch spezielle Requisiten besorgen — Stichwort Trachtenbrauchtum, Biathlon-Nachbarschaft oder Chiemsee-Motiv.",
    qualitaetP1:
      "Auf- und Abbau sind inklusive und laufen so, dass Du sie nicht mitbekommst. Quadratmeter Stellfläche, Steckdose, 20 Minuten Zeit. Auch in Bauernstuben, die auf dem Plan zu eng aussehen, finden wir in praktisch allen Fällen einen Platz, der passt.",
    qualitaetP2:
      "Die Technik ist gemacht, um im Ernstfall zu tragen: DSLR mit hochauflösendem Sensor, Softbox-Blitz für warme, weiche Beleuchtung, High-End-Drucker mit Hochglanz-Ausdrucken. Die 400 Drucke pro Paket reichen für Hochzeiten bis ca. 120 Gäste in der Chiemgau-Region souverän.",
    localTitle: "Fotobox-Einsätze im Chiemgau",
    localP1:
      "Der Chiemgau mit Traunstein als Zentrum ist für uns regelmäßige Strecke. Wir liefern zu Hochzeiten in Trostberger Gasthöfen, zu Firmenfeiern in Siegsdorfer Tagungshäusern, zu Jubiläen in Vereinsheimen von Inzell und Ruhpolding, zu Geburtstagen an Gasthöfen rund um den Waginger See. Was die Region auszeichnet: echte, ungekünstelte Stimmung — und genau die fotografiert die Box am liebsten.",
    localP2:
      "Besonderheit der Chiemgau-Region: Der Chiemsee und die Nähe zu Salzburg bringen internationale Gäste auf Hochzeiten. Die Fotobox funktioniert sprachfrei (Bedienung läuft über einfache Symbole), deshalb ist sie auch für deutsch-englisch-italienische Gästelisten geeignet.",
    faqs: [
      {
        question: "Liefert Ihr auch nach Ruhpolding oder Inzell?",
        answer:
          "Ja, beide Orte sind für uns regelmäßige Ziele. Die Fahrtkosten liegen je nach genauer Adresse bei etwa 80–110 €. Der Preiskonfigurator gibt Dir die exakte Summe.",
      },
      {
        question: "Kann die Fotobox bei einer Outdoor-Feier am Chiemsee aufgebaut werden?",
        answer:
          "Ja, wenn wir einen überdachten Bereich (Pavillon, Zelt) und eine Steckdose haben. Direkter Regen oder starke Sonne sind für Elektronik und Drucker nicht ideal — unter einem Zelt funktioniert das Setup problemlos.",
      },
      {
        question: "Habt Ihr Hochzeits-Drucklayouts für Trachtenhochzeiten im Chiemgau?",
        answer:
          "Ja, dezente, bayerisch-trachtige Layouts gehören bei uns zum Standard. Wir passen Rahmen, Schriftzüge und Farben an Deine Vorstellungen an — kostenlos, einfach bei der Anfrage erwähnen.",
      },
    ],
  },
  {
    slug: "wasserburg",
    name: "Wasserburg am Inn",
    region: "Oberbayern",
    landkreis: "Landkreis Rosenheim",
    lat: 48.0600,
    lng: 12.2286,
    distanceFromRosenheim: 25,
    nearbyAreas: ["Edling", "Eiselfing", "Babensham", "Amerang"],
    seoTitle: "Fotobox Wasserburg am Inn mieten — ab 379 € mit Drucker",
    description:
      "Fotobox für Wasserburg am Inn mieten — direkt in der historischen Altstadt oder in den Nachbarorten Edling, Eiselfing, Amerang. Inkl. Drucker, Aufbau, Druckflatrate.",
    heroTeaser: "Fotobox für Wasserburg am Inn",
    heroP1:
      "Wasserburg am Inn hat die wohl schönste Altstadt-Kulisse der Region — eine Halbinsel im Inn, eng bebaut, voller historischer Locations. Hochzeiten und Firmenfeiern finden hier oft in Rahmen statt, den Du woanders nicht bekommst: Gewölbekeller, Altstadthotels, Patrizierhäuser am Marienplatz. Die Knipserl-Fotobox bringt Sofortdruck-Fotos in diese Settings — gedruckte Erinnerungen, die dem Flair der Stadt gerecht werden.",
    heroP2:
      "Wir liefern nach Wasserburg selbst und in die Umlandorte Edling, Eiselfing, Babensham und Amerang. Von Bruckmühl aus sind wir in rund 25 Minuten vor Ort. Die Fotobox selbst ist ein Komplettpaket aus Profi-Kamera, Studiobeleuchtung und Thermodrucker — alles, was Du für hochwertige Sofort-Abzüge brauchst, ohne dass jemand auf Deiner Feier mit Technik hantieren muss.",
    momenteP1:
      "Wasserburger Hochzeiten haben oft diesen besonderen Moment: Das Brautpaar steht vor einer fast 700 Jahre alten Kulisse, die Gäste stehen drumherum — und dann taucht jemand mit dem frischen Fotostreifen aus der Box auf, der die Szene einfängt. Dieser Moment ist schwer inszeniert zu bekommen; die Box liefert ihn nebenbei.",
    momenteP2:
      "In den Veranstaltungsräumen der Altstadt entstehen Fotos, die oft nicht nur das Event zeigen, sondern auch die Location: historische Gewölbe, hohe Decken, alte Holztreppen. Die Fotobox fotografiert, was vor der Kamera steht — und das sind in Wasserburg meistens Gäste in besonderen Räumen.",
    bedienungP1:
      "Die Bedienung ist so einfach, dass sie auch im Getümmel einer Altstadthochzeit funktioniert. Touchscreen antippen, Countdown läuft, Blitz, Druck — in unter zehn Sekunden hat Dein Gast den Fotostreifen in der Hand. Kein Erklär-Personal nötig.",
    bedienungP2:
      "Drei Filter, klare Vorschau, ein Druck-Knopf. Das reicht — und sorgt dafür, dass die Box nicht belegt wird, während andere Gäste warten. Wasserburger Feiern sind oft intim mit 40–80 Gästen, da ist Schnelligkeit besonders wichtig.",
    fotopropsP1:
      "Der Prop-Koffer kommt zu jeder Buchung mit: Hüte, Brillen, Papp-Schilder und einige größere Requisiten. Für Wasserburger Altstadt-Hochzeiten passen dezentere, klassische Accessoires meistens besser — sag beim Anfragen Bescheid, dann stimmen wir den Inhalt darauf ab.",
    fotopropsP2:
      "Die Props sind für 150 Gäste kalkuliert und werden zwischen den Events desinfiziert. Wer in einem historischen Rahmen feiert, möchte meistens weniger Party-Neon und mehr klassische Requisiten — wir haben beides dabei.",
    qualitaetP1:
      "In den historischen Räumen von Wasserburg ist Platz manchmal knapp. Wir bauen die Fotobox kompakt auf — ein Quadratmeter reicht, eine normale Steckdose genügt. Auch in Räumen mit niedriger Decke oder engen Türen klappt der Aufbau; das Setup ist modular angelegt.",
    qualitaetP2:
      "Die Technik hat keine Schwachstelle: DSLR, Softbox-Blitzanlage, Thermosublimationsdrucker, Full-HD-Touchscreen. Alles auf Profi-Niveau. Die Fotoabzüge sind im Hochglanz-Format 10×15 cm, wischfest, laminierähnlich haltbar. 400 Ausdrucke pro Paket — für eine Wasserburger Hochzeit mit 80 Gästen deutlich mehr als genug.",
    localTitle: "Fotobox-Einsätze in Wasserburg und der Inn-Region",
    localP1:
      "Wasserburg hat für uns eine Sonderstellung — die Altstadt ist klein, die Locations sind überschaubar, aber die Atmosphäre ist einzigartig. Wir stellen die Fotobox in Gewölbekellern, in den Festsälen der Hotels am Marienplatz, in Privaträumen der Altstadt auf. Die Nachbarorte Edling, Eiselfing, Babensham und Amerang bringen rustikalere Locations — Gasthöfe, Bauernhof-Hochzeiten, Vereinsheime.",
    localP2:
      "Weil Wasserburg von Bruckmühl aus in 25 Minuten erreichbar ist, sind die Anfahrtskosten hier besonders günstig. Für Locations in der Altstadt klären wir vorab, wo genau wir be- und entladen können — die engen Straßen der Innhalbinsel sind bekanntlich nicht für große Fahrzeuge gemacht, aber wir kommen mit einem Kombi problemlos durch.",
    faqs: [
      {
        question: "Kann die Fotobox in der Wasserburger Altstadt aufgebaut werden?",
        answer:
          "Ja. Wir klären vorab mit Dir Be- und Entladung (die engen Altstadtgassen brauchen etwas Koordination) und transportieren das Equipment in den Veranstaltungsraum. Auch Gewölbekeller und historische Säle mit niedrigen Durchgängen sind kein Problem.",
      },
      {
        question: "Gibt es einen Anfahrtszuschlag nach Wasserburg?",
        answer:
          "Bei 25 km von unserem Standort liegt Wasserburg in einer günstigen Fahrtkosten-Zone. Der Preiskonfigurator zeigt Dir die exakte Summe je nach genauer Adresse — typischerweise bei etwa 40–60 €.",
      },
      {
        question: "Können wir das Drucklayout auf Wasserburg-Motive abstimmen?",
        answer:
          "Ja, wir gestalten das Layout kostenlos individuell. Silhouette der Altstadt, historische Optik oder klassisches Hochzeitsdesign — Deine Vorstellung, wir setzen sie um.",
      },
    ],
  },
  {
    slug: "muehldorf",
    name: "Mühldorf am Inn",
    region: "Oberbayern",
    landkreis: "Landkreis Mühldorf am Inn",
    lat: 48.2472,
    lng: 12.5243,
    distanceFromRosenheim: 50,
    nearbyAreas: ["Waldkraiburg", "Ampfing", "Neumarkt-Sankt Veit", "Polling"],
    seoTitle: "Fotobox Mühldorf am Inn mieten — ab 379 € inkl. Sofortdruck",
    description:
      "Fotobox für Mühldorf am Inn, Waldkraiburg, Ampfing und Neumarkt-Sankt Veit mieten. Inkl. Drucker, Aufbau und Druckflatrate für Hochzeit, Firmenfeier und Party.",
    heroTeaser: "Fotobox für Mühldorf und das Inn-Salzach-Land",
    heroP1:
      "Mühldorf am Inn liegt im Inn-Salzach-Land — zwischen Altötting, Waldkraiburg und dem österreichischen Grenzgebiet. Die Knipserl-Fotobox ist in der Region seit Jahren unterwegs: Hochzeiten in Mühldorf selbst, Firmenfeiern bei Betrieben in Waldkraiburg, Jubiläen in Ampfinger Gasthöfen, Geburtstage in Neumarkt-Sankt Veit. Überall dort liefert die Box Sofortdruck-Fotos, die Deine Gäste mit nach Hause nehmen.",
    heroP2:
      "Wir liefern in den gesamten Landkreis Mühldorf am Inn — neben den Hauptorten Waldkraiburg, Ampfing, Neumarkt-Sankt Veit und Polling auch zu kleineren Gemeinden. Aus Bruckmühl sind wir in 45–60 Minuten vor Ort. Die Fotobox ist ein Profi-Setup mit Spiegelreflexkamera, Studioblitz und Thermosublimationsdrucker — keine halben Sachen, volle Bildqualität.",
    momenteP1:
      "Mühldorfer Feiern haben oft diese eigene, zurückhaltende Art — es wird nicht überkandidelt, sondern bodenständig gefeiert. Die Fotobox passt genau in diesen Stil: Sie steht da, niemand muss sie ankündigen, und nach einer Stunde ist sie der unauffällige Treffpunkt, an dem die besten Bilder des Abends entstehen.",
    momenteP2:
      "Besonders auf Firmenfeiern in Waldkraiburger Industriebetrieben merken wir: Die Box bringt Kollegen zusammen, die sich sonst kaum begegnen. Fertigung und Verwaltung, Azubis und Meister — alle stehen irgendwann vor dem gleichen Objektiv. Das sind oft die Bilder, die später im Pausenraum aushängen.",
    bedienungP1:
      "Die Bedienung ist bewusst simpel: Touchscreen antippen, Countdown, Foto, Druck. Keine Anmeldung, keine Menüs, kein Anschließen an WLAN. Der 22-Zoll-Bildschirm zeigt Schritt für Schritt, was zu tun ist — jeder Gast kommt in unter 30 Sekunden zum Ergebnis.",
    bedienungP2:
      "Drei Filter stehen zur Wahl: Farbe, Schwarz-Weiß, Retro. Nicht mehr. Das ist kein Mangel, sondern Absicht: Weniger Optionen bedeuten, dass die Box nicht verstopft wird, während jemand sich überlegt, welcher Effekt am besten aussieht.",
    fotopropsP1:
      "Unser Prop-Koffer ist bei jeder Buchung dabei. Hüte, Brillen, Schilder, ein paar ausgefallenere Requisiten — das Set deckt alle üblichen Events ab. Für Industriebetriebe und Firmenfeiern packen wir auf Wunsch Business-Accessoires ein; für Hochzeiten und Geburtstage passt das Standard-Set meistens perfekt.",
    fotopropsP2:
      "Die Props werden zwischen den Events gereinigt, sind stabil gebaut und reichen auch für größere Feiern mit 150+ Gästen. Wer in Mühldorf oder Umgebung ein thematisches Event plant, sagt uns einfach vorher Bescheid — wir passen den Koffer an.",
    qualitaetP1:
      "Auf- und Abbau erledigen wir — Du hast damit nichts zu tun. Ein Quadratmeter Stellfläche, eine Steckdose und 20 Minuten Vorlauf. Das funktioniert in Gasthof-Sälen, Industriehallen und Privaträumen gleichermaßen. Das Setup ist auf schnellen Aufbau und unauffällige Integration ausgelegt.",
    qualitaetP2:
      "Die Technik steht für gleichbleibende Qualität: aktuelle Spiegelreflexkamera, Studioblitz mit Softbox (die ausgeglichene Belichtung auch bei schwierigem Raumlicht liefert), High-End-Thermosublimationsdrucker. Die Ausdrucke sind in 10×15 cm Hochglanz, wasserfest, wischfest. 400 Stück sind pro Paket enthalten.",
    localTitle: "Fotobox-Einsätze in Mühldorf und im Inn-Salzach-Land",
    localP1:
      "Der Landkreis Mühldorf am Inn ist für uns regelmäßige Strecke. Wir liefern zu Hochzeiten in Mühldorfer Altstadt-Locations, zu Firmenfeiern bei Waldkraiburger Gewerbebetrieben (wo wir oft gebrandete Drucklayouts passend zum Corporate Design machen), zu Jubiläen in Ampfinger Gasthöfen, zu privaten Feiern in Neumarkt-Sankt Veit und Polling.",
    localP2:
      "Besonderheit im Inn-Salzach-Land: Die Region hat eine stark ausgeprägte Betriebsstruktur — große Industriebetriebe in Waldkraiburg, mittelständische Gewerbebetriebe in Mühldorf selbst. Für diese Firmen-Events haben wir Erfahrung mit größeren Gästelisten (200+), Logo-Branding und Corporate-Design-Drucklayouts.",
    faqs: [
      {
        question: "Liefert Ihr auch an Waldkraiburger Industriebetriebe?",
        answer:
          "Ja, regelmäßig. Wir kennen die typischen Anfahrtsrouten und Parksituationen bei größeren Betrieben in Waldkraiburg. Für Firmenfeiern passen wir das Drucklayout kostenlos an Euer Corporate Design an.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Mühldorf?",
        answer:
          "Mühldorf liegt bei etwa 50 km ab unserem Standort. Die Fahrtkosten liegen typisch bei 80–110 € je nach genauer Adresse. Der Preiskonfigurator berechnet Dir die exakte Summe in Echtzeit.",
      },
      {
        question: "Kann die Fotobox für eine Firmenfeier mit 200 Gästen in Waldkraiburg die 400 Drucke bedienen?",
        answer:
          "400 Drucke sind im Standardpaket enthalten — bei 200 Gästen ergibt das durchschnittlich 2 Ausdrucke pro Gast, was für die meisten Firmenfeiern reicht. Bei höherem Bedarf können wir gegen Aufpreis zusätzliche Druckkapazität bereitstellen.",
      },
    ],
  },
  {
    slug: "erding",
    name: "Erding",
    region: "Oberbayern",
    landkreis: "Landkreis Erding",
    lat: 48.3056,
    lng: 11.9057,
    distanceFromRosenheim: 80,
    nearbyAreas: ["Dorfen", "Taufkirchen", "Wartenberg", "Isen"],
    seoTitle: "Fotobox Erding mieten — Hochzeit, Geburtstag, Therme-Events",
    description:
      "Fotobox für Erding, Dorfen, Taufkirchen und Wartenberg mieten. Profi-Drucker, Aufbau und Druckflatrate inkl. Perfekt für Therme-Events, Hochzeiten und Firmenfeiern.",
    heroTeaser: "Fotobox für Erding und das Erdinger Land",
    heroP1:
      "Erding ist bekannt für Therme, Weißbier und die Nähe zum Flughafen München — und als eine Region, in der gerne gefeiert wird. Die Knipserl-Fotobox ist hier regelmäßig im Einsatz: Hochzeiten in Gasthöfen rund um Erding, Firmenevents bei Betrieben mit Flughafen-Anbindung, Jubiläen in Dorfener Vereinsheimen, Geburtstagsfeiern in Privaträumen. Sofortdruck-Fotos, die Deine Gäste direkt in die Hand bekommen.",
    heroP2:
      "Wir liefern in den gesamten Landkreis Erding — neben Erding selbst auch nach Dorfen, Taufkirchen, Wartenberg und Isen. Aus Bruckmühl sind wir in etwa 80 Minuten vor Ort; der eigentliche Setup dauert rund 20 Minuten. Enthalten sind Profi-Spiegelreflexkamera, Studioblitz mit Softbox und ein Thermosublimationsdrucker für hochwertige Abzüge.",
    momenteP1:
      "In Erdinger Feierräumen sehen wir oft, wie die Fotobox das Eis bricht. Gerade bei Firmenfeiern mit verteilten Teams — Produktion in einem Gebäude, Büro in einem anderen, Technik wieder woanders — entstehen vor der Box die ersten ungezwungenen Begegnungen. Und die Bilder davon hängen später am Schwarzen Brett.",
    momenteP2:
      "Bei Hochzeiten in der Region — oft mit Gästen, die zum Teil aus dem Münchner Umland anreisen — funktioniert die Box als zentraler Treffpunkt. Wer gerade keinen Bekannten findet, posiert mit jemandem, der nur zufällig vorbeikommt. Aus diesen Zufällen entstehen die schönsten unerwarteten Bilder.",
    bedienungP1:
      "Die Bedienung ist selbsterklärend — Tippen auf den 22-Zoll-Touchscreen, Countdown läuft, Kamera blitzt, Drucker arbeitet. In unter zehn Sekunden liegt der Fotostreifen in der Hand. Keine App, keine Anmeldung, kein Personal nötig.",
    bedienungP2:
      "Drei Filter, eine Vorschau, klarer Druck-Button. Das reicht für jede Altersgruppe. Wir haben die Oberfläche in den letzten Jahren auf Hunderten von Events getestet — auf vielen davon im Großraum München/Erding — und die Mehrheit der Gäste braucht weder Erklärung noch Probelauf.",
    fotopropsP1:
      "Unser Prop-Koffer kommt zu jedem Event mit — Hüte, Brillen, Pappschilder, ein paar größere Accessoires. Für Erdinger Firmenfeiern gerade zur Weihnachtszeit sind Business-verträgliche Requisiten praktisch; für Hochzeiten passt das klassische Set. Wer ein Motto feiert (Weißbier-Party, Therme-Gast, Oktoberfest-Nachklang), bekommt auf Anfrage passend abgestimmte Props.",
    fotopropsP2:
      "Die Props sind für größere Feiern ausgelegt, werden zwischen den Events desinfiziert und sind robust genug für Mehrfachnutzung. Wenn Du ein spezielles Set brauchst, lass es uns bei der Anfrage wissen — wir können mit Vorlauf auch branchenspezifische Requisiten besorgen.",
    qualitaetP1:
      "Der Auf- und Abbau ist in jedem Paket enthalten und läuft ohne Deine Beteiligung. Quadratmeter Stellfläche, Steckdose, rund 20 Minuten Vorlaufzeit. Auch in größeren Hallen — etwa bei Firmenevents an Erdinger Flughafen-Pendler-Betrieben — platzieren wir die Box so, dass sie sichtbar, aber nicht im Weg ist.",
    qualitaetP2:
      "Technisch vollwertig: aktuelle Spiegelreflexkamera, Softbox-Blitz für ausgeglichene Belichtung, Thermosublimationsdrucker mit Hochglanz-Ausgabe. Die Fotoabzüge sind 10×15 cm, wisch- und wasserfest. 400 Drucke sind in jedem Paket dabei — für 150-Gäste-Events reicht das komfortabel.",
    localTitle: "Fotobox-Einsätze in Erding und im Erdinger Land",
    localP1:
      "Der Landkreis Erding ist ein gemischter Raum — Flughafen-Nähe, Weißbier-Region, Therme Erding als Highlight, aber auch ländliche Dörfer rund um Dorfen, Taufkirchen und Isen. Wir liefern zu Hochzeiten in Erdinger Gasthöfen, zu Firmenfeiern in Pendler-Betrieben mit Flughafen-Bezug, zu Jubiläen in Taufkirchener Vereinsheimen und zu privaten Feiern in Dorfen.",
    localP2:
      "Therme Erding als Event-Location ist ein Sonderfall — wir liefern auf Wunsch auch zu Feiern in gebuchten Veranstaltungsräumen mit Wellness-Anschluss. Für Firmenevents mit Flughafen-nahen Gästelisten (internationales Publikum) ist die Fotobox sprachfrei bedienbar, was häufig dankbar aufgenommen wird.",
    faqs: [
      {
        question: "Liefert Ihr auch zu Veranstaltungen in der Therme Erding?",
        answer:
          "Wir liefern zu gebuchten Veranstaltungsräumen in der Region Therme Erding — sag uns einfach die genaue Adresse und den Raum, dann klären wir Anlieferung und Aufbau vorab. Im Wasserbereich selbst ist die Technik logischerweise nicht einsetzbar.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Erding?",
        answer:
          "Erding liegt bei etwa 80 km von unserem Standort entfernt — die Fahrtkosten liegen typisch bei 130–160 €. Der Preiskonfigurator zeigt Dir die exakte Summe für Deine Adresse.",
      },
      {
        question: "Funktioniert die Fotobox auch bei einer Firmenfeier mit internationalen Gästen?",
        answer:
          "Ja. Die Bedienung läuft über Symbole und Countdown — ohne Text. Wir kombinieren das auf Wunsch mit einem mehrsprachigen Drucklayout (deutsch/englisch) oder einem neutralen Design ohne Sprachelemente.",
      },
    ],
  },
  {
    slug: "kufstein",
    name: "Kufstein",
    region: "Tirol",
    landkreis: "Bezirk Kufstein",
    lat: 47.5833,
    lng: 12.1666,
    distanceFromRosenheim: 25,
    nearbyAreas: ["Wörgl", "Söll", "Kiefersfelden", "Ebbs", "Ellmau"],
    seoTitle: "Fotobox Kufstein mieten — Tirol-Events ab 379 € inkl. Drucker",
    description:
      "Fotobox für Kufstein und Tirol mieten — wir liefern auch über die deutsch-österreichische Grenze. Inkl. Drucker, Aufbau, Druckflatrate für Hochzeit und Firmenfeier.",
    heroTeaser: "Fotobox für Kufstein und das Kufsteinerland",
    heroP1:
      "Kufstein liegt keine 25 Minuten von unserem Standort entfernt — auf der österreichischen Seite der Grenze, mit der Festung über dem Inntal. Die Knipserl-Fotobox macht an der Grenze keinen Halt: Wir liefern nach Kufstein, Wörgl, Söll, Kiefersfelden, Ebbs und Ellmau regelmäßig. Hochzeiten vor Bergkulisse, Firmenfeiern in Tiroler Gasthöfen, Geburtstage in privaten Räumen — die Box funktioniert grenzüberschreitend genauso zuverlässig.",
    heroP2:
      "Die Fotobox ist ein Komplettpaket: Spiegelreflexkamera, Studioblitz mit Softbox, Thermosublimationsdrucker. Wir übernehmen Auf- und Abbau, liefern 400 Hochglanz-Fotoabzüge in 10×15 cm, stellen einen Koffer mit Fotoprops bereit. Für Tirol-Events passen wir das Drucklayout gerne regional an — Bergmotive, Tiroler Symbolik, klassisch-elegante Designs.",
    momenteP1:
      "Auf Tiroler Hochzeiten in der Kufsteiner Gegend läuft die Fotobox oft zu einem leicht anderen Rhythmus als in Bayern: Die Feiern ziehen sich tiefer in die Nacht, die Musik ist lauter, und die Box wird öfter nach Mitternacht frequentiert. Genau dafür ist sie gemacht — die Studio-Blitzanlage liefert bei jedem Raumlicht gleichbleibende Qualität.",
    momenteP2:
      "In Kufsteiner Bergbauernhof-Locations und Schloss-Hotels sehen wir häufig Gäste, die sich zuerst zurückhalten. Nach dem zweiten Stamperl stehen genau die gleichen Gäste in der Schlange vor der Fotobox. Die Bilder sind dann meist das Ehrlichste, was der Abend zu bieten hat.",
    bedienungP1:
      "Die Box braucht keine Erklärung — in keiner Sprache. Symbole auf dem 22-Zoll-Touchscreen, Countdown, Blitz, Ausdruck. Das funktioniert für österreichische Gäste genauso wie für deutsche oder italienische. Wir haben sie auf gemischten Gästelisten getestet, und sie läuft überall gleich unkompliziert.",
    bedienungP2:
      "Drei Filter-Optionen (Farbe, Schwarz-Weiß, Retro) reichen für jeden Geschmack. Keine Menüs, keine Untermenüs, kein Konto. Der Druck kommt, bevor der nächste Gast sich überlegt, was er will.",
    fotopropsP1:
      "Unser Prop-Koffer ist grenzüberschreitend: Hüte, Brillen, Schilder, ein paar Tiroler-Tracht-verträgliche Accessoires. Für Kufsteiner Hochzeiten mit Tracht passen klassische Requisiten meistens gut; für Après-Ski-Feiern (ja, die gibt's auch am Boden) sind die wilderen Stücke gefragt.",
    fotopropsP2:
      "Die Props werden zwischen den Events desinfiziert und sind robust für große Gästelisten. Wenn Du ein bestimmtes Tiroler Motto planst (Almhütte, Bergfest, Trachten-Abend), sag uns beim Anfragen Bescheid — wir können mit Vorlauf passende Props zusätzlich besorgen.",
    qualitaetP1:
      "In Tiroler Locations ist Platz meistens ausreichend — wir brauchen einen Quadratmeter Stellfläche und eine Steckdose (Schuko-Standard funktioniert in Österreich genauso). Der Aufbau dauert rund 20 Minuten, wir kommen rechtzeitig vor Deinem Event an und brechen ab, wenn die letzten Gäste gegangen sind.",
    qualitaetP2:
      "Die Technik ist unverhandelbar: aktuelle DSLR-Kamera, Studioblitz mit Softbox, High-End-Thermosublimationsdrucker. Die Fotoabzüge sind wasser- und wischfest auf Hochglanz-Papier. 400 Stück pro Paket sind enthalten — für eine Kufsteiner Hochzeit mit 120 Gästen mehr als ausreichend.",
    localTitle: "Fotobox-Einsätze in Kufstein und im Kufsteinerland",
    localP1:
      "Kufstein gehört zu den Orten, die wir trotz Grenzlage regelmäßig beliefern — von Bruckmühl über Kiefersfelden direkt über die Grenze. Wir liefern zu Hochzeiten in Kufsteiner Festsälen, zu Firmenfeiern in Wörgler Betrieben, zu Geburtstagen in privaten Räumen in Söll, Ebbs und Ellmau. Die Entfernung von unserem Standort ist mit etwa 25 km eine der kürzesten unter unseren Landing-Destinationen.",
    localP2:
      "Tirol bringt ein paar Besonderheiten mit — aber keine, die Dich betreffen: Abrechnung in Euro, Leistung identisch zum Angebot für deutsche Locations, Schuko-Stecker passt ohnehin. Wir liefern nach Kufstein, Wörgl, Söll, Kiefersfelden, Ebbs und Ellmau genauso unkompliziert wie nach Rosenheim.",
    faqs: [
      {
        question: "Liefert Ihr über die Grenze nach Tirol?",
        answer:
          "Ja. Kufstein und das Kufsteinerland gehören zu unseren regelmäßigen Zielen. Aus Bruckmühl kommend sind wir in etwa 30 Minuten vor Ort — Grenze passieren wir einfach durch. Die Abrechnung erfolgt in Euro, die Leistung entspricht 1:1 dem Angebot für deutsche Locations.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Kufstein?",
        answer:
          "Kufstein liegt bei ca. 25 km ab unserem Standort — die Fahrtkosten liegen typischerweise bei etwa 40–60 €. Der Preiskonfigurator zeigt Dir die genaue Summe je nach Zielort.",
      },
      {
        question: "Funktioniert die Fotobox auch auf einer Berghütten-Feier im Kufsteinerland?",
        answer:
          "Ja, wenn die Hütte eine normale Steckdose (230V Schuko) und einen überdachten Innenraum hat. Direkter Witterungs-Einfluss (Regen, starke Sonne) ist für Elektronik und Drucker nicht geeignet — innen oder unter einem Zelt funktioniert das Setup problemlos.",
      },
    ],
  },
] as const;

export type CitySlug = (typeof SEO_CITIES)[number]["slug"];
