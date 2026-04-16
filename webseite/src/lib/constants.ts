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

// Landing-Page-Content für /fotobox/[city]-Routen.
// Quelle 1:1 aus den alten WP-Seiten knipserl.de/fotobox-{slug}/ — minimale Korrekturen
// (Typos, OG-Leaks). Für Wasserburg/Mühldorf/Erding/Kufstein existierte keine alte
// Seite; diese adaptieren den Text der typ-ähnlichsten Stadt (siehe Kommentar).
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
    seoTitle: "Fotobox in Rosenheim inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Rosenheim. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Die Fotobox aus Rosenheim für den perfekten Schnappschuss",
    heroP1:
      "Mit der Knipserl-Fotobox aus Rosenheim könnt Ihr auf Eurer Hochzeit, dem Firmenevent oder auf Messen die geschossenen Bilder direkt in den Händen halten! Unser Knipserl ähnelt im Prinzip einer Kamera mit Selbstauslöser.",
    heroP2:
      "Die gigantische Selfie-Maschine hat jedoch den großen Vorteil, dass die Bilder in einer bestechend scharfen Qualität geschossen werden und diese zudem direkt für eine Menge Spaß sorgen! Denn unsere Fotobox aus Rosenheim kommt inklusive eingebautem Profi-Drucker, der die Bilder der hochauflösenden Spiegelreflexkamera im Handumdrehen ausdruckt! Das garantiert einmalige Erinnerungen!",
    momenteP1:
      "Eure Gäste werden bestens unterhalten und Ihr werdet schnell erkennen, dass sich so manche der Partybesucher schneller vor der Linse finden, als sie selbst glauben konnten. Ein Spaß für Groß und Klein, Jung und Alt und vor allem auch für Früh und Spät. Klar ist, je später desto verrückter.",
    momenteP2: "",
    bedienungP1:
      "Die Bedienung unserer Fotobox ist ein Kinderspiel. Vergleichbar mit einem klassischen Fotoautomat vergangener Jahrzehnte muss sich einfach davorgesetzt werden und es kann losgehen. Der kleine aber feine Unterschied ist der 22-Zoll-Bildschirm, der die Bedienung der mietbaren Fotobox aus Rosenheim noch einfacher macht.",
    bedienungP2:
      "Selbsterklärend und intuitiv kann zwischen verschiedenen Fotoeffekten gewählt werden, die stark an die Funktionen von Instagram erinnern. Wer also keine physischen Accessoires vor Ort hat, kann dennoch problemlos seine Gäste (digital) mit Hüten, Masken, Katzenohren oder Schnurrhaaren versehen. Egal ob Firmenfeier, Hochzeit, Geburtstag oder Vereinsfest — die einfache Handhabung sorgt dafür, dass die Fotobox durchgehend genutzt wird und ganz nebenbei viele authentische Erinnerungen entstehen, ohne dass sich jemand um die Technik kümmern muss.",
    fotopropsP1:
      "Ein Photobooth für die Hochzeit mieten oder damit das Firmenevent aufpeppen ist eine Leichtigkeit. Vor allem durch unsere Fotoprops (Accessoires). Das lustige Zubehör macht eine Gruppe von Freunden in Sekunden zu einer Rockband. Sie macht Kollegen in Windeseile zu einer bunten Partymeute oder Geburtstagsgäste zu wilden Tieren.",
    fotopropsP2:
      "Dadurch braucht es nicht zwangsläufig das digitale Tuning durch die Instagram-Fotoeffekte. Mehr Spaß, mehr glorreiche Erinnerungen und mehr Gesprächsstoff für Eure Hochzeit, Euer Firmenevent oder Messeauftritt ist ohnehin garantiert.",
    qualitaetP1:
      "Um Euch das Mieten unserer Fotobox so einfach wie möglich zu gestalten, ist der Auf- und Abbau natürlich inklusive. Dies verstehen wir als selbstverständlich. Viel Platz benötigen wir dafür nicht, der Abstand beträgt nur wenige Meter.",
    qualitaetP2:
      "Damit jedoch lange nicht genug: Das Knipserl steht für höchste Qualität. Eine moderne Spiegelreflexkamera (DSLR) sorgt für hochauflösende Fotos, die bei jeglichen Lichtverhältnissen gelingen. Der Touchscreen des Bildschirms lässt Euch die Einstellungen wie im Schlaf beherrschen, und der High-End-Drucker (Thermotransfer) sorgt für mitnehmbare Erinnerungen, die auf Hochglanz-Fotopapier lange für Freude sorgen werden.",
    faqs: [
      {
        question: "Wie lange im Voraus sollte ich die Fotobox für Rosenheim buchen?",
        answer:
          "Für Hochzeits-Samstage zwischen Mai und September empfehlen wir 4–6 Monate Vorlauf. Wochentage und Termine außerhalb der Hauptsaison sind meist auch kurzfristiger verfügbar. Nach Deiner Anfrage melden wir uns innerhalb von 24 Stunden mit einer Verfügbarkeitsauskunft.",
      },
      {
        question: "Fallen innerhalb von Rosenheim Anfahrtskosten an?",
        answer:
          "Das Stadtgebiet Rosenheim und der 15-km-Umkreis sind im Basispreis enthalten. Für größere Distanzen greift unsere Kilometer-Staffel — die exakten Fahrtkosten kannst Du im Preiskonfigurator direkt für Deine Adresse berechnen.",
      },
      {
        question: "Kann das Drucklayout individuell gestaltet werden?",
        answer:
          "Ja. Ein individuelles Drucklayout ist Teil des Basispakets — wir passen Rahmen, Logo, Event-Titel und Datum an Deine Vorgaben an. Schick uns Deine Vorstellung (Firmenlogo, Hochzeitsmotiv, Farbvorgaben), wir setzen das Layout entsprechend auf.",
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
    seoTitle: "Fotobox in München inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in München. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Deine Fotobox für München und Umgebung",
    heroP1:
      "Unscheinbar und fast schon unauffällig versteckt sie sich in der Ecke auf vielen Hochzeiten oder Firmenevents: Doch stille Wasser sind tief, und unsere Fotobox für München macht so manchen Abend einfach unvergesslich.",
    heroP2:
      "Eine Fotobox mieten für Hochzeiten oder Events ist ein Ereignis. Zwar liefern wir mit unserem Knipserl nur das Produkt, doch Ihr und Eure Gäste machen das Ganze zum Happening. Denn kaum hat sich der erste Gast vor die Linse getraut, steht unser Photobooth nicht mehr still. Sowohl für Kinder als natürlich auch für Erwachsene jeden Alters ist ein solches Party-Accessoire eine wahre Freude.",
    momenteP1:
      "Unser Knipserl versüßt Euren Abend. Lasst die Gäste mit der Fotobox Spaß haben, erhaltet einmalige Erinnerungen und lasst uns die Arbeit machen. Auf- und Abbau übernehmen wir, und die Bilder erhaltet Ihr ganz bequem und ohne Umstände alle online. Viel Spaß beim Knipsen.",
    momenteP2: "",
    bedienungP1:
      "Ein Problem mit der Einstellung wird es nicht geben. Ein großer 22-Zoll-Touchscreen sorgt für ein intuitives Manövrieren durch das Menü. Justierungen des Fokus oder der Helligkeit übernimmt unsere professionelle Spiegelreflexkamera ohnehin ganz von alleine.",
    bedienungP2:
      "Wer die Hüte oder Brillen nicht aufsetzen möchte oder diese nicht vorhanden sind, der kann dennoch eine ganz schöne Gaudi aus dem Bild machen. Denn mit Fotoeffekten wie bei Instagram kann das Bild nachträglich auf dem Touchscreen verändert werden. Der integrierte Profi-Drucker sorgt mit Studioqualität dafür, dass die Gäste alle Bilder in Händen halten können.",
    fotopropsP1:
      "Auf Wunsch liefern wir auch unsere beliebten Fotoprops mit: Dazu gehören zum Beispiel jede Menge aufblasbare Instrumente, die eine Gruppe Gäste vor der Kamera schnell zur Rockband werden lassen. Darüber hinaus lassen sich unzählige weitere Accessoires finden, mit denen das Bild aufgepeppt werden kann: Hüte, Brillen, Perücken, Spritzpistolen oder Haarreife lassen die witzigsten Bilder entstehen.",
    fotopropsP2: "",
    qualitaetP1:
      "Damit die Bilder fleißig verteilt werden können, ist im Mietpreis eine Druckflatrate inklusive. Sie reicht für satte 13 Stunden Dauerbetrieb. Mit dem „Mediakit“ für 400 Bilder à 10×15 cm oder 800 Bilder à 5×15 cm geht Euch die Farbe nie aus, und Ihr könnt knipsen, was das Zeug hält.",
    qualitaetP2:
      "Außerdem bekommt Ihr nach dem Event einen Online-Zugang, über den Ihr alle geschossenen Bilder digital downloaden und abspeichern könnt. Das ist optimal, um Danksagungen per E-Mail zu verschicken oder die Gäste am nächsten Tag in WhatsApp mit Schnappschüssen zu überraschen.",
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
    seoTitle: "Fotobox in Ebersberg inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Ebersberg. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Ihr sucht eine Fotobox in Ebersberg? Knipserl!",
    heroP1:
      "Egal ob Hochzeit, Firmenevent oder Messe: Der perfekte Schnappschuss gelingt Euch garantiert mit unserer Fotobox für Ebersberg. Das Knipserl liefert Euch hochauflösende Fotos, die Eure Gäste direkt in den Händen halten können.",
    heroP2:
      "Dadurch nimmt der Abend eine ungeahnte Dynamik an. Junge, alte, männliche und weibliche Gäste tragen bunte Hüte, schiefe Brillen oder entdecken ihre Leidenschaft für das Spielen aufblasbarer Musikinstrumente. Alles nur durch unsere Knipserl-Fotobox aus Ebersberg.",
    momenteP1:
      "Und glaubt uns: Ihr müsst Eure Gäste sicher nicht zum Fotomachen auffordern. Schon nach kurzer Zeit werden sich junge und alte Gäste vor der Linse finden, eine Verkleidung schräger als die andere. Das ist nicht nur genial für Hochzeiten, sondern auch optimal für Firmenevents, um die Kollegen untereinander vertrauter zu machen.",
    momenteP2: "",
    bedienungP1:
      "Das Aussehen und auch die Funktionsweise des Knipserls erinnert an einen alten Fotoautomaten: davorsetzen, lächeln (oder eine Grimasse ziehen) und warten, bis es auslöst. Doch unsere Fotobox unterscheidet sich dann doch ein wenig von den klassischen Automaten und macht sich modernster Technik zu Hilfe.",
    bedienungP2:
      "Über den verbauten 22-Zoll-Touchscreen können nicht nur alle Einstellungen kinderleicht und intuitiv vorgenommen werden. Auch „digitale Verkleidung“ ist darüber möglich: Vergleichbar mit den Fotoeffekten von Instagram oder Snapchat lassen sich nach dem Foto jedem Model (digital) Hüte aufsetzen, Brillen aufziehen oder in Windeseile Schnauzbärte wachsen.",
    fotopropsP1:
      "Wer dabei gerne auf die alte Schule vertraut und physische Accessoires wünscht, dem helfen wir gerne. Unsere Fotoprops können an der Fotobox platziert werden — und bevor man sich versieht, gründen sich in wenigen Sekunden Bands mit aufblasbaren Musikinstrumenten, oder wildgewordene Partytiere mit Löwenmähnen und Katzenohren treiben ihr Unwesen.",
    fotopropsP2: "",
    qualitaetP1:
      "Eine Fotobox mieten für die Hochzeit oder das Firmenevent wird Euch bei Knipserl so einfach wie möglich gemacht. Ihr müsst Euch weder um den Aufbau noch um den Abbau kümmern — das übernehmen selbstverständlich wir. Außerdem stellen wir Euch eine digitale, passwortgesicherte Datenbank zur Verfügung, über die Ihr die Bilder nachträglich abrufen, herunterladen und verschicken könnt. Physisch erhaltet Ihr die Bilder ohnehin direkt nach der Entstehung.",
    qualitaetP2:
      "Das Drum-Herum stimmt also. So sind wir froh, sagen zu können, dass auch das Innere der Fotobox aus Ebersberg stimmt. Die Spiegelreflexkamera sorgt für hochauflösende Bilder, die bei jeglichen Lichtverhältnissen gestochen scharf geschossen werden. Der Touchscreen lässt jeden Nutzer jegliche Einstellungen ohne Probleme vornehmen, und eine digitale Nachbearbeitung ist ebenfalls umgehend möglich.",
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
    seoTitle: "Fotobox in Miesbach inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Miesbach. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Fotobox mieten in Miesbach: der ultimative Fotospaß",
    heroP1:
      "Wenn Du einen Event wie eine Hochzeit oder eine Weihnachtsfeier in Miesbach planst und allen Gästen einmalige Erinnerungen mitgeben möchtest, dann solltest Du eine Fotobox mieten und in Miesbach am Ort Deines Events aufstellen. Denn die Knipserl Fotobox lädt Deine Gäste zu einer spontanen Fotosession ein: mit neuen oder alten Freunden und Geschäftspartnern, mit großen Lieben und kleinen Liebeleien. Die Fotobox macht es ihnen allen ganz einfach, ein paar hochauflösende Fotos als Erinnerung ans Event mitzunehmen. Und wer mag, kann noch visuelle Effekte hinzufügen.",
    heroP2:
      "Zusätzlich liefern wir auf Wunsch diverse Accessoires, unsere Fotoprops. Sie erlauben es Deinen Gästen, sich für Fotos zu verkleiden: vielleicht als Rockband oder als Wildtiere? Der Fantasie sind nur wenige Grenzen gesetzt. Eine Fotobox zu mieten für Miesbach ist ganz einfach und einfach toll. Ermögliche Deinen Gästen und Dir diese einmaligen Erinnerungen.",
    momenteP1:
      "Du musst Deine Gäste sicher nicht zum Fotomachen auffordern. Schon nach kurzer Zeit finden sich junge und alte Gäste vor der Linse, eine Verkleidung schräger als die andere. Das ist nicht nur genial für Hochzeiten, sondern auch optimal für Firmenevents, um die Kollegen untereinander vertrauter zu machen.",
    momenteP2: "",
    bedienungP1:
      "Falls Du Dich dafür entscheidest, eine Knipserl-Fotobox zu mieten und in Miesbach aufzustellen, fällt für Dich kaum Arbeit an. Knipserl bringt Dir die Fotobox zum Aufstellort, baut sie auf und holt sie am Ende wieder ab. Die Bedienung der Fotobox ist kinderleicht und intuitiv. Du musst niemandem erklären, wie man mit der Fotobox Fotos schießt. Alle Funktionen lassen sich bequem und einfach über das nutzerfreundliche Programm auf dem 22-Zoll-Bildschirm steuern.",
    bedienungP2:
      "Nach dem Fotografieren druckt der professionelle Thermosublimationsdrucker der Fotobox die Fotos innerhalb von etwa acht Sekunden aus und versieht sie zusätzlich mit einer Schutzschicht, damit das Bild so brillant bleibt, wie es aus dem Drucker kommt.",
    fotopropsP1:
      "Die Knipserl-Fotobox zu mieten und in Miesbach und Umgebung einzusetzen, kann aus mehreren Gründen eine gute Idee sein: Sie kann auf einem Messestand die Präsentation des eigentlichen Angebots unterstützen. Sie kann zusätzlichen Spaß bringen, wenn eine Party bereits im vollen Gange ist. Oder sie kann das Eis brechen, wenn sie gerade erst beginnt und die Gäste noch etwas verhalten sind.",
    fotopropsP2:
      "Zum Spaß können dann auch unsere Fotoprops beitragen. Die Accessoires geben Deinen Gästen die Chance, sich individuell zu verkleiden und auszustatten, was den Reiz noch steigert. Du siehst: Es gibt viele gute Gründe dafür, die Knipserl-Fotobox zu mieten — in Miesbach kann man mit ihr sehr viel Spaß haben.",
    qualitaetP1:
      "Wer eine Fotobox mieten und in Miesbach aufstellen lassen möchte, erhält Top-Fototechnik. Die Bilder entstehen mit einer modernen Spiegelreflexkamera (DSLR). Die Auflösung liegt bei 16 Megapixeln, und die Technik der Fotobox funktioniert bei unterschiedlichsten Lichtverhältnissen, sodass sie sich in verschiedensten Locations einsetzen lässt.",
    qualitaetP2:
      "Alle Fotos, die während des Events entstehen, liegen am Ende einerseits in ausgedruckter Form vor. Zusätzlich kannst Du am Tag nach Deinem Event alle Fotos in voller Auflösung (4928×3264 Pixel) herunterladen und Teilnehmern des Events den Link zum Downloadbereich senden.",
    faqs: [
      {
        question: "Liefert Ihr auch nach Bad Wiessee oder Rottach-Egern?",
        answer:
          "Ja. Der gesamte Tegernseer Raum gehört zum regulären Liefergebiet. Die Fahrtkosten liegen je nach genauer Location zwischen 60 und 90 €.",
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
    seoTitle: "Fotobox in Traunstein inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Traunstein. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Fotobox mieten in Traunstein — bringt mehr Spaß in Dein Event",
    heroP1:
      "Du möchtest eine Fotobox mieten für Traunstein, um sie auf einer Hochzeit, einer Firmenfeier oder auf einer Messe aufzustellen? Das ist eine ganz hervorragende Idee. Deine Gäste und Besucher werden sich freuen. Sie können sie spontan nutzen, um sich auf dem jeweiligen Event zu verewigen: vielleicht mit neuen Freunden, alten Bekannten oder mit der sich anbahnenden neuen großen Liebe.",
    heroP2:
      "Wir liefern die Fotobox auf Wunsch mit diversen Fotoprops (Accessoires), mit denen sich Deine Gäste verkleiden können, was ihnen noch mehr Spaß bringt. Mit dem 22-Zoll-Bildschirm können sie alternativ oder zusätzlich auch visuelle Effekte ins Bild zaubern. Die Bedienung der Fotobox ist kinderleicht und lässt qualitativ hochwertige, hochauflösende Fotos entstehen. Also: für mehr Spaß auf Deinen Events — Fotobox mieten, Traunstein soll feiern wie nie zuvor.",
    momenteP1: "",
    momenteP2: "",
    bedienungP1:
      "Hinter der Knipserl-Fotobox steckt hervorragende Technik, sodass in kürzester Zeit qualitativ hochwertige Fotos entstehen. Geschossen werden diese Fotos mit einer modernen Spiegelreflexkamera (DSLR) mit einer Auflösung von 16 Megapixel. Die Technik ist so eingestellt, dass mit der Fotobox bei verschiedensten Lichtverhältnissen gute Fotos entstehen. Alle mit der Fotobox in Traunstein entstandenen Fotos erhältst Du einen Tag nach dem Event in voller Auflösung (4928×3264 Pixel) als Download.",
    bedienungP2:
      "Bei jedem Mieten der Fotobox für Traunstein liefert Knipserl ein Komplettpaket, das neben der Fotobox auch den Drucker beinhaltet. Mit ihm können Deine Gäste oder die Besucher Deines Messestands die geschossenen Fotos sofort auf Hochglanz-Fotopapier in Studioqualität ausdrucken und als reizvolle Erinnerung mit nach Hause nehmen. Der professionelle Thermosublimationsdrucker druckt die Fotos in drei Farbschichten und schützt sie anschließend mit einer Schutzschicht.",
    fotopropsP1:
      "Das eigene Aussehen durch virtuelle Fotoeffekte zu verändern, ist toll. Aber sich für ein Foto zu verkleiden, macht oft noch viel mehr Spaß. Wenn Du Dich dafür entscheidest, die Fotobox zu mieten und in Traunstein aufstellen zu lassen, liefern wir Dir deshalb auf Wunsch neben der Fotobox und dem Drucker zahlreiche Accessoires zum Verkleiden. So bringt die Fotobox Dir und Deinen Gästen noch mehr Spaß.",
    fotopropsP2: "",
    qualitaetP1:
      "Der Auf- und Abbau der Knipserl ist bei jeder Buchung für Traunstein inklusive. Wir liefern die Fotobox zum Aufstellort, bauen sie auf und holen sie nach dem Event wieder ab — Du hast mit der Technik keinen Aufwand.",
    qualitaetP2:
      "Als Komplettpaket gehört neben der Fotobox der professionelle Drucker dazu. Die Bilder landen direkt auf Hochglanz-Fotopapier in Studioqualität. Zusätzlich stellen wir Dir eine Online-Galerie mit Passwortschutz bereit, in der alle Fotos nach dem Event zum Download für Dich und Deine Gäste verfügbar sind.",
    faqs: [
      {
        question: "Liefert Ihr auch nach Ruhpolding oder Inzell?",
        answer:
          "Ja, beide Orte gehören zum regulären Liefergebiet. Die Fahrtkosten liegen je nach genauer Adresse bei etwa 80–110 €.",
      },
      {
        question: "Kann die Fotobox bei einer Outdoor-Feier am Chiemsee aufgebaut werden?",
        answer:
          "Ja, mit überdachtem Bereich (Pavillon, Zelt) und Zugang zu einer Steckdose. Direkter Regen oder starke Sonne sind für Elektronik und Drucker nicht geeignet.",
      },
      {
        question: "Habt Ihr Hochzeits-Drucklayouts mit bayerisch-trachtiger Optik?",
        answer:
          "Ja. Das individuelle Drucklayout ist Teil des Basispakets — regionale Motive, Trachten-Elemente und passende Farbgebung lassen sich ohne Aufpreis integrieren.",
      },
    ],
  },
  // Wasserburg: adaptiert aus Miesbach (Du-Form, kleine-Stadt-Charakter, ähnliche Distanz)
  {
    slug: "wasserburg",
    name: "Wasserburg am Inn",
    region: "Oberbayern",
    landkreis: "Landkreis Rosenheim",
    lat: 48.0600,
    lng: 12.2286,
    distanceFromRosenheim: 25,
    nearbyAreas: ["Edling", "Eiselfing", "Babensham", "Amerang"],
    seoTitle: "Fotobox in Wasserburg am Inn inkl. Drucker mieten | Auf- und Abbau inkl.",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Wasserburg am Inn. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Fotobox mieten in Wasserburg am Inn",
    heroP1:
      "Wenn Du einen Event wie eine Hochzeit oder eine Weihnachtsfeier in Wasserburg am Inn planst und allen Gästen einmalige Erinnerungen mitgeben möchtest, dann lohnt es sich, eine Fotobox zu mieten und direkt an Deinem Veranstaltungsort aufzustellen. Die Knipserl-Fotobox lädt Deine Gäste zu einer spontanen Fotosession ein: mit neuen oder alten Freunden, mit großen Lieben und kleinen Liebeleien. Hochauflösende Fotos als Erinnerung ans Event sind damit schnell und unkompliziert gemacht.",
    heroP2:
      "Auf Wunsch liefern wir diverse Accessoires mit — unsere Fotoprops. Sie erlauben es Deinen Gästen, sich für Fotos zu verkleiden: als Rockband, als Wildtiere, als was auch immer Spaß macht. Eine Fotobox zu mieten für Wasserburg am Inn ist ganz einfach, und Deine Feier bekommt damit ein Unterhaltungselement, das von allen Altersgruppen angenommen wird.",
    momenteP1:
      "Du musst Deine Gäste sicher nicht zum Fotomachen auffordern. Schon nach kurzer Zeit finden sich junge und alte Gäste vor der Linse, eine Verkleidung schräger als die andere. Das funktioniert nicht nur auf Hochzeiten, sondern auch optimal bei Firmenevents, um Kollegen untereinander vertrauter zu machen.",
    momenteP2: "",
    bedienungP1:
      "Falls Du Dich dafür entscheidest, eine Knipserl-Fotobox zu mieten und in Wasserburg am Inn aufzustellen, fällt für Dich kaum Arbeit an. Wir bringen Dir die Fotobox zum Aufstellort, bauen sie auf und holen sie am Ende wieder ab. Die Bedienung ist kinderleicht und intuitiv. Du musst niemandem erklären, wie man damit Fotos schießt — alle Funktionen lassen sich über das nutzerfreundliche Programm auf dem 22-Zoll-Bildschirm steuern.",
    bedienungP2:
      "Nach dem Fotografieren druckt der professionelle Thermosublimationsdrucker der Fotobox die Fotos innerhalb von etwa acht Sekunden aus und versieht sie zusätzlich mit einer Schutzschicht, damit das Bild so brillant bleibt, wie es aus dem Drucker kommt.",
    fotopropsP1:
      "Eine Fotobox in Wasserburg am Inn einzusetzen, kann aus mehreren Gründen eine gute Idee sein: Sie kann auf einem Messestand die Präsentation des eigentlichen Angebots unterstützen. Sie kann zusätzlichen Spaß bringen, wenn eine Party bereits im vollen Gange ist. Oder sie kann das Eis brechen, wenn sie gerade erst beginnt und die Gäste noch etwas verhalten sind.",
    fotopropsP2:
      "Zum Spaß können dann auch unsere Fotoprops beitragen. Die Accessoires geben Deinen Gästen die Chance, sich individuell zu verkleiden und auszustatten, was den Reiz der Fotobox weiter steigert.",
    qualitaetP1:
      "Wer eine Fotobox mieten und in Wasserburg am Inn aufstellen lassen möchte, erhält Top-Fototechnik. Die Bilder entstehen mit einer modernen Spiegelreflexkamera (DSLR). Die Auflösung liegt bei 16 Megapixeln, und die Technik der Fotobox funktioniert bei unterschiedlichsten Lichtverhältnissen, sodass sie sich in verschiedensten Locations einsetzen lässt.",
    qualitaetP2:
      "Alle Fotos, die während des Events entstehen, liegen am Ende in ausgedruckter Form vor. Zusätzlich kannst Du am Tag nach Deinem Event alle Fotos in voller Auflösung (4928×3264 Pixel) herunterladen und Teilnehmern des Events den Link zum Downloadbereich senden.",
    faqs: [
      {
        question: "Kann die Fotobox in der Wasserburger Altstadt aufgebaut werden?",
        answer:
          "Ja. Be- und Entladung in den engen Altstadtgassen koordinieren wir vorab mit Dir. Der Transport ins Veranstaltungsgebäude und der Aufbau auch in historischen Sälen oder Gewölberäumen sind Teil unserer Dienstleistung.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Wasserburg?",
        answer:
          "Wasserburg am Inn liegt etwa 25 Kilometer von unserem Standort entfernt. Die Fahrtkosten liegen typischerweise bei 40–60 €. Der Preiskonfigurator gibt Dir die exakte Summe für Deine Adresse aus.",
      },
      {
        question: "Können wir das Drucklayout individuell gestalten?",
        answer:
          "Ja. Das individuelle Drucklayout ist Teil des Basispakets — Rahmen, Logo, Event-Titel und Datum passen wir an Deine Vorgaben an.",
      },
    ],
  },
  // Mühldorf: adaptiert aus Ebersberg (Ihr-Form, Landkreis-Charakter)
  {
    slug: "muehldorf",
    name: "Mühldorf am Inn",
    region: "Oberbayern",
    landkreis: "Landkreis Mühldorf am Inn",
    lat: 48.2472,
    lng: 12.5243,
    distanceFromRosenheim: 50,
    nearbyAreas: ["Waldkraiburg", "Ampfing", "Neumarkt-Sankt Veit", "Polling"],
    seoTitle: "Fotobox in Mühldorf am Inn inkl. Drucker mieten | Auf- und Abbau inkl.",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Mühldorf am Inn. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Ihr sucht eine Fotobox für Mühldorf am Inn? Knipserl!",
    heroP1:
      "Egal ob Hochzeit, Firmenevent oder Messe: Der perfekte Schnappschuss gelingt Euch garantiert mit unserer Fotobox für Mühldorf am Inn. Das Knipserl liefert Euch hochauflösende Fotos, die Eure Gäste direkt in den Händen halten können.",
    heroP2:
      "Dadurch nimmt der Abend eine ungeahnte Dynamik an. Junge, alte, männliche und weibliche Gäste tragen bunte Hüte, schiefe Brillen oder entdecken ihre Leidenschaft für das Spielen aufblasbarer Musikinstrumente — alles mit der Knipserl-Fotobox für Mühldorf am Inn und das Inn-Salzach-Land.",
    momenteP1:
      "Und glaubt uns: Ihr müsst Eure Gäste sicher nicht zum Fotomachen auffordern. Schon nach kurzer Zeit werden sich junge und alte Gäste vor der Linse finden, eine Verkleidung schräger als die andere. Das ist nicht nur genial für Hochzeiten, sondern auch optimal für Firmenevents — etwa in Waldkraiburger Gewerbebetrieben —, um Kollegen untereinander vertrauter zu machen.",
    momenteP2: "",
    bedienungP1:
      "Das Aussehen und auch die Funktionsweise des Knipserls erinnert an einen alten Fotoautomaten: davorsetzen, lächeln und warten, bis es auslöst. Doch unsere Fotobox unterscheidet sich dann doch ein wenig von den klassischen Automaten und macht sich modernster Technik zu Hilfe.",
    bedienungP2:
      "Über den verbauten 22-Zoll-Touchscreen können alle Einstellungen kinderleicht und intuitiv vorgenommen werden. Auch „digitale Verkleidung“ ist darüber möglich: Vergleichbar mit den Fotoeffekten von Instagram oder Snapchat lassen sich nach dem Foto jedem Model (digital) Hüte aufsetzen, Brillen aufziehen oder in Windeseile Schnauzbärte wachsen.",
    fotopropsP1:
      "Wer auf physische Accessoires setzt, dem helfen wir gerne. Unsere Fotoprops können an der Fotobox platziert werden — und bevor man sich versieht, gründen sich in wenigen Sekunden Bands mit aufblasbaren Musikinstrumenten, oder wildgewordene Partytiere mit Löwenmähnen und Katzenohren treiben ihr Unwesen.",
    fotopropsP2: "",
    qualitaetP1:
      "Eine Fotobox mieten für die Hochzeit oder das Firmenevent wird Euch bei Knipserl so einfach wie möglich gemacht. Ihr müsst Euch weder um den Aufbau noch um den Abbau kümmern — das übernehmen selbstverständlich wir. Außerdem stellen wir Euch eine digitale, passwortgesicherte Online-Galerie zur Verfügung, über die Ihr die Bilder nachträglich abrufen, herunterladen und verschicken könnt. Physisch erhaltet Ihr die Bilder ohnehin direkt nach der Entstehung.",
    qualitaetP2:
      "Die Spiegelreflexkamera sorgt für hochauflösende Bilder, die bei jeglichen Lichtverhältnissen gestochen scharf entstehen. Der Touchscreen lässt jeden Nutzer alle Einstellungen ohne Probleme vornehmen, und eine digitale Nachbearbeitung ist ebenfalls umgehend möglich.",
    faqs: [
      {
        question: "Liefert Ihr auch an Waldkraiburger Firmenveranstaltungen?",
        answer:
          "Ja, regelmäßig. Die Anfahrt nach Waldkraiburg ist Teil des regulären Liefergebiets. Für Firmenfeiern passen wir das Drucklayout an Euer Corporate Design an — im Basispaket enthalten.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Mühldorf?",
        answer:
          "Mühldorf am Inn liegt etwa 50 Kilometer vom Standort entfernt. Die Fahrtkosten liegen typisch bei 80–110 €. Der Preiskonfigurator berechnet Dir die exakte Summe in Echtzeit.",
      },
      {
        question: "Reichen 400 Drucke für eine Firmenfeier mit 200 Gästen?",
        answer:
          "Die 400 Drucke im Basispaket entsprechen durchschnittlich zwei Ausdrucken pro Gast. Für größere Events mit höherem Druckbedarf ist eine Erweiterung der Druckkapazität gegen Aufpreis möglich.",
      },
    ],
  },
  // Erding: adaptiert aus München (Ihr-Form, Stadt mit Umland-Bezug)
  {
    slug: "erding",
    name: "Erding",
    region: "Oberbayern",
    landkreis: "Landkreis Erding",
    lat: 48.3056,
    lng: 11.9057,
    distanceFromRosenheim: 80,
    nearbyAreas: ["Dorfen", "Taufkirchen", "Wartenberg", "Isen"],
    seoTitle: "Fotobox in Erding inkl. Drucker mieten | inkl. Auf- und Abbau",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Erding. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout und Online-Galerie.",
    heroTeaser: "Deine Fotobox für Erding und das Erdinger Land",
    heroP1:
      "Unscheinbar und fast schon unauffällig versteckt sie sich in der Ecke auf vielen Hochzeiten oder Firmenevents: Doch stille Wasser sind tief, und unsere Fotobox für Erding macht so manchen Abend einfach unvergesslich.",
    heroP2:
      "Eine Fotobox mieten für Hochzeiten oder Events ist ein Ereignis. Zwar liefern wir mit unserem Knipserl nur das Produkt, doch Ihr und Eure Gäste macht das Ganze zum Happening. Denn kaum hat sich der erste Gast vor die Linse getraut, steht unser Photobooth nicht mehr still. Sowohl für Kinder als auch für Erwachsene jeden Alters ist die Fotobox eine wahre Freude.",
    momenteP1:
      "Unser Knipserl versüßt Euren Abend. Lasst die Gäste mit der Fotobox Spaß haben, erhaltet einmalige Erinnerungen und lasst uns die Arbeit machen. Auf- und Abbau übernehmen wir, und die Bilder erhaltet Ihr ganz bequem und ohne Umstände alle online.",
    momenteP2: "",
    bedienungP1:
      "Ein Problem mit der Einstellung wird es nicht geben. Ein großer 22-Zoll-Touchscreen sorgt für ein intuitives Manövrieren durch das Menü. Justierungen des Fokus oder der Helligkeit übernimmt unsere professionelle Spiegelreflexkamera ohnehin ganz von alleine.",
    bedienungP2:
      "Wer die Hüte oder Brillen nicht aufsetzen möchte oder diese nicht vorhanden sind, kann dennoch eine schöne Gaudi aus dem Bild machen: Mit Fotoeffekten wie bei Instagram kann das Bild nachträglich auf dem Touchscreen verändert werden. Der integrierte Profi-Drucker liefert mit Studioqualität die Bilder, die Gäste direkt in den Händen halten.",
    fotopropsP1:
      "Auf Wunsch liefern wir auch unsere beliebten Fotoprops mit: jede Menge aufblasbare Instrumente, die eine Gruppe Gäste vor der Kamera schnell zur Rockband werden lassen. Darüber hinaus lassen sich unzählige weitere Accessoires finden, mit denen das Bild aufgepeppt werden kann — Hüte, Brillen, Perücken, Spritzpistolen oder Haarreife lassen die witzigsten Bilder entstehen.",
    fotopropsP2: "",
    qualitaetP1:
      "Damit die Bilder fleißig verteilt werden können, ist im Mietpreis eine Druckflatrate inklusive. Sie reicht für rund 13 Stunden Dauerbetrieb. Mit dem „Mediakit“ für 400 Bilder à 10×15 cm oder 800 Bilder à 5×15 cm geht Euch die Farbe nie aus, und Ihr könnt knipsen, was das Zeug hält.",
    qualitaetP2:
      "Nach dem Event bekommt Ihr einen Online-Zugang, über den Ihr alle geschossenen Bilder digital herunterladen und abspeichern könnt. Das ist optimal, um Danksagungen per E-Mail zu verschicken oder Gäste am nächsten Tag in WhatsApp mit Schnappschüssen zu überraschen.",
    faqs: [
      {
        question: "Liefert Ihr auch zu Veranstaltungen in der Region Therme Erding?",
        answer:
          "Ja, zu gebuchten Veranstaltungsräumen der Therme Erding. Die genaue Raumadresse und -nummer klären wir bei der Anfrage. Im Wasserbereich selbst ist das technische Setup aus naheliegenden Gründen nicht einsetzbar.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Erding?",
        answer:
          "Erding liegt etwa 80 Kilometer von unserem Standort entfernt. Die Fahrtkosten liegen typisch bei 130–160 €. Der Preiskonfigurator zeigt Dir die exakte Summe für Deine Adresse.",
      },
      {
        question: "Funktioniert die Fotobox bei internationalen Gästelisten?",
        answer:
          "Ja. Die Kernbedienung läuft sprachunabhängig über Symbole und Countdown. Das Drucklayout lässt sich zweisprachig (deutsch/englisch) oder sprachneutral gestalten — Teil des Basispakets.",
      },
    ],
  },
  // Kufstein: adaptiert aus Traunstein (Du-Form, "Spaß"-Ton, Alpenraum)
  {
    slug: "kufstein",
    name: "Kufstein",
    region: "Tirol",
    landkreis: "Bezirk Kufstein",
    lat: 47.5833,
    lng: 12.1666,
    distanceFromRosenheim: 25,
    nearbyAreas: ["Wörgl", "Söll", "Kiefersfelden", "Ebbs", "Ellmau"],
    seoTitle: "Fotobox in Kufstein inkl. Drucker mieten | Tirol-Events ab 379 €",
    description:
      "Miete unsere Knipserl Fotobox für Deine Hochzeit, Party oder Firmenfeier in Kufstein. Wir liefern auch über die Grenze nach Tirol. Inkl. Druck-Flatrate, Auf- und Abbau, eigenes Fotolayout.",
    heroTeaser: "Fotobox mieten in Kufstein — für mehr Spaß auf Deinem Event",
    heroP1:
      "Du möchtest eine Fotobox mieten für Kufstein, um sie auf einer Hochzeit, einer Firmenfeier oder auf einem privaten Event aufzustellen? Das ist eine hervorragende Idee. Deine Gäste können sie spontan nutzen, um sich auf dem jeweiligen Event zu verewigen — mit neuen Freunden, alten Bekannten oder mit der sich anbahnenden neuen großen Liebe.",
    heroP2:
      "Wir liefern die Fotobox auf Wunsch mit diversen Fotoprops, mit denen sich Deine Gäste verkleiden können. Mit dem 22-Zoll-Bildschirm lassen sich alternativ oder zusätzlich visuelle Effekte ins Bild zaubern. Die Bedienung ist kinderleicht und lässt qualitativ hochwertige, hochauflösende Fotos entstehen. Von unserem Standort in Bruckmühl aus sind wir in rund 25 Minuten in Kufstein — über die Grenze nach Tirol und zurück ist Alltag für uns.",
    momenteP1: "",
    momenteP2: "",
    bedienungP1:
      "Hinter der Knipserl-Fotobox steckt Technik auf Profi-Niveau. Fotos entstehen mit einer modernen Spiegelreflexkamera (DSLR) mit einer Auflösung von 16 Megapixel. Die Technik funktioniert bei verschiedensten Lichtverhältnissen, sodass sich die Fotobox in Kufsteiner Festsälen, Tiroler Gasthöfen oder privaten Eventräumen zuverlässig einsetzen lässt. Alle Fotos erhältst Du einen Tag nach dem Event in voller Auflösung (4928×3264 Pixel) als Download.",
    bedienungP2:
      "Bei jedem Mieten der Fotobox für Kufstein liefert Knipserl ein Komplettpaket, das neben der Fotobox auch den Drucker beinhaltet. Deine Gäste oder Besucher können die geschossenen Fotos sofort auf Hochglanz-Fotopapier in Studioqualität ausdrucken und als Erinnerung mit nach Hause nehmen. Der professionelle Thermosublimationsdrucker druckt in drei Farbschichten und schützt die Bilder anschließend mit einer Schutzschicht.",
    fotopropsP1:
      "Das Aussehen durch virtuelle Fotoeffekte zu verändern, ist toll — aber sich für ein Foto zu verkleiden, macht oft noch viel mehr Spaß. Wenn Du Dich entscheidest, die Fotobox zu mieten und in Kufstein aufstellen zu lassen, liefern wir Dir auf Wunsch neben der Fotobox und dem Drucker zahlreiche Accessoires zum Verkleiden.",
    fotopropsP2: "",
    qualitaetP1:
      "Der Auf- und Abbau der Fotobox ist bei jeder Buchung für Kufstein inklusive. Wir bringen die Box zum Aufstellort, bauen sie auf und holen sie nach dem Event wieder ab. Die Grenze passieren wir dabei unkompliziert — Abrechnung erfolgt in Euro, die Leistung entspricht 1:1 dem Angebot für deutsche Zielorte.",
    qualitaetP2:
      "Als Komplettpaket gehört neben der Fotobox der professionelle Drucker dazu. Die Bilder landen direkt auf Hochglanz-Fotopapier in Studioqualität. Zusätzlich stellen wir Dir eine Online-Galerie mit Passwortschutz bereit, in der alle Fotos nach dem Event zum Download verfügbar sind.",
    faqs: [
      {
        question: "Liefert Ihr über die Grenze nach Tirol?",
        answer:
          "Ja. Kufstein und das Kufsteinerland gehören zum regulären Liefergebiet. Die Grenzquerung ist innerhalb des Schengenraums unkompliziert. Abrechnung in Euro, Leistung entspricht 1:1 dem Angebot für deutsche Zielorte.",
      },
      {
        question: "Wie hoch sind die Fahrtkosten nach Kufstein?",
        answer:
          "Kufstein liegt etwa 25 Kilometer vom Standort entfernt. Die Fahrtkosten liegen typischerweise bei 40–60 €. Der Preiskonfigurator berechnet die genaue Summe für die Zieladresse.",
      },
      {
        question: "Funktioniert die Fotobox auch auf einer Berghütten-Feier im Kufsteinerland?",
        answer:
          "Ja, sofern die Hütte eine normale Schuko-Steckdose (230 V) und einen überdachten Innenraum bietet. Direkte Witterungseinflüsse wie Regen oder starke Sonne sind für Elektronik und Drucker nicht geeignet.",
      },
    ],
  },
] as const;

export type CitySlug = (typeof SEO_CITIES)[number]["slug"];
