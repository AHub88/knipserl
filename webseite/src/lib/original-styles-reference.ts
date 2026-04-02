/**
 * KNIPSERL.DE ORIGINAL WEBSITE - CSS STYLES REFERENCE
 * =====================================================
 * Extracted from the live WordPress site (The7 theme + WPBakery Page Builder)
 * Date: 2026-03-31
 *
 * This file documents every extracted CSS value needed to replicate
 * each subpage pixel-perfectly in the Next.js rebuild.
 */

// =============================================================================
// GLOBAL DESIGN TOKENS
// =============================================================================

export const THEME = {
  // WordPress Theme: The7 v14.2.1.1 with WPBakery (Visual Composer) v8.7.2

  colors: {
    accent: "#f3a300", // rgb(243, 163, 0) - Orange/amber, used for CTAs, links, highlights
    accentBg: "#f3a300",
    base: "#1a171b", // rgb(26, 23, 27) - Near-black, primary text color
    white: "#ffffff",
    bodyBg: "#ffffff",
    divider: "rgba(51, 51, 51, 0.12)",
    headerBg: "rgba(255, 255, 255, 0)", // Transparent (overlays wood texture)
    pageTitleBg: "rgba(114, 119, 125, 0)", // Transparent
    pageTitleColor: "#ffffff",
    footerBg: "rgba(27, 27, 27, 0)", // Transparent (wood texture shows through)
    darkSectionBg: "rgb(102, 102, 102)", // Used for dark content sections
    buttonText: "rgb(10, 10, 10)", // Near-black text on orange buttons
    inputBg: "rgba(0, 0, 0, 0.07)", // Light grey for form fields
    calendarDayHeaderColor: "rgb(255, 255, 255)",
    calendarDayColor: "rgb(26, 23, 27)",
    linkColor: "rgb(243, 163, 0)", // Orange links
    linkDecoration: "underline",
  },

  fonts: {
    // PRIMARY FONT: Body text, navigation, buttons, form fields
    body: {
      family: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
      weights: [400, 600, 700],
    },
    // HEADING FONT: All headings (H1-H6), page titles, section headings
    heading: {
      family:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      weights: [600, 700, 800],
    },
    // SECONDARY (minor usage in menu extras)
    secondary: {
      family: '"Open Sans", Helvetica, Arial, Verdana, sans-serif',
      weights: [400],
    },
  },

  typography: {
    body: {
      fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "20px",
      lineHeight: "30px", // actual computed; CSS var is 26px
      fontWeight: 400,
      color: "rgb(26, 23, 27)",
    },
    h1: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "50px", // page-title specific override; theme default is 40px
      fontWeight: 700,
      lineHeight: "60px", // theme default is 48px
      textTransform: "uppercase" as const,
      color: "rgb(255, 255, 255)", // White on dark wood header
      letterSpacing: "normal",
    },
    h2: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "28px", // theme default; overridden per-element (30-45px seen)
      fontWeight: 700,
      lineHeight: "34px",
      textTransform: "none" as const,
      color: "rgb(26, 23, 27)",
    },
    h3: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "24px",
      fontWeight: 700,
      lineHeight: "32px",
      textTransform: "none" as const,
      color: "rgb(26, 23, 27)",
    },
    h4: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "20px",
      fontWeight: 700,
      lineHeight: "28px",
    },
    h5: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "16px",
      fontWeight: 700,
    },
    h6: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "14px",
      fontWeight: 600,
    },
  },

  layout: {
    contentWidth: "1150px", // .content wrapper width
    vcRowWidth: "1180px", // WPBakery row width (with -15px margin on each side)
    contentPadding: "0px",
    mainPaddingBottom: "80px", // #main padding-bottom
    baseBorderRadius: "0px",
  },

  backgroundImages: {
    // Dark wood texture - used for header, page-title, footer, FAQ accordion bars
    woodTexture:
      "https://www.knipserl.de/wp-content/uploads/2018/02/fancy-header.jpg",
    // Light paper/grunge texture - main content background
    paperTexture:
      "https://www.knipserl.de/wp-content/uploads/2018/10/main_back.jpg.webp",
    paperTextureSize: "1000px 584px",
    paperTextureRepeat: "repeat",
    // Dark variant paper texture (for dark sections)
    darkPaperTexture:
      "https://www.knipserl.de/wp-content/uploads/2016/05/main_back_gr-2.jpg.webp",
    darkPaperTextureSize: "1000px 500px",
  },

  breakpoints: [
    "320px",
    "375px",
    "480px",
    "600px",
    "768px",
    "860px",
    "960px",
    "1024px",
    "1100px",
    "1170px",
    "1199px",
  ],
} as const;

// =============================================================================
// HEADER / NAVIGATION
// =============================================================================

export const HEADER = {
  wrapper: {
    // .masthead - absolutely positioned over page-title
    position: "absolute" as const,
    zIndex: 102,
    height: "130px",
    padding: "0px 50px",
    backgroundColor: "transparent", // Overlays the wood background
  },

  logo: {
    src: "https://www.knipserl.de/wp-content/uploads/2018/10/logo-mobile.png",
    width: 250,
    height: 70,
    maxWidth: "100%",
  },

  navLink: {
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "20px",
    fontWeight: 400,
    color: "rgb(255, 255, 255)", // White text on dark header
    textTransform: "none" as const,
    letterSpacing: "normal",
    padding: "6px 10px",
    textDecoration: "none",
  },

  navItems: [
    "Die Fotobox",
    "Preise",
    "Extras", // dropdown: Gastetelefon, LOVE Buchstaben
    "FAQ",
    "Whatsapp Anfrage",
    "Termin prufen",
  ],

  // Active menu item has an underline via .decoration-line element
  activeNavLink: {
    borderBottom: "2px solid white", // visual underline on active page
  },

  mobileMenu: {
    // Floating hamburger button (shows on mobile)
    floatingBtn: {
      position: "fixed" as const,
      right: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      color: "rgb(243, 163, 0)", // Orange icon
      padding: "10px",
      fontSize: "20px",
    },
  },
} as const;

// =============================================================================
// PAGE TITLE / HERO SECTION (shared across all subpages)
// =============================================================================

export const PAGE_TITLE = {
  // .page-title.solid-bg.bg-img-enabled
  wrapper: {
    height: "180px",
    paddingTop: "130px", // accounts for absolute-positioned header
    backgroundImage: `url("${THEME.backgroundImages.woodTexture}")`,
    backgroundSize: "cover",
    backgroundPosition: "50% 50%",
    display: "flex",
    alignItems: "flex-end",
  },

  title: {
    // H1 inside .page-title-head
    fontFamily:
      '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "50px",
    fontWeight: 700,
    lineHeight: "60px",
    color: "rgb(255, 255, 255)",
    textTransform: "uppercase" as const,
    margin: "0px",
    padding: "0px",
  },

  // TORN PAPER EDGE - transition between header and content
  // Achieved via #main::before pseudo-element + paper texture background overlap
  tornPaperEdge: {
    // The #main element has background: url(main_back.jpg) which is a paper texture
    // #main::before creates a 50px high element positioned at top: -30px
    // This creates the illusion of torn paper overlapping the wood header
    pseudoBefore: {
      content: '""',
      display: "block",
      height: "50px",
      position: "relative" as const,
      top: "-30px",
      // The visual torn effect comes from the paper texture background bleeding
      // over the wood header area
    },
  },
} as const;

// =============================================================================
// MAIN CONTENT AREA
// =============================================================================

export const MAIN_CONTENT = {
  // #main
  background: {
    image: `url("${THEME.backgroundImages.paperTexture}")`,
    size: "1000px 584px",
    repeat: "repeat",
    position: "0% 0%",
  },
  padding: "0px 0px 80px",

  // .content
  contentWrapper: {
    width: "1150px",
    maxWidth: "none",
    padding: "0px",
    margin: "0px",
  },
} as const;

// =============================================================================
// BUTTONS
// =============================================================================

export const BUTTONS = {
  // PRIMARY CTA - Orange filled button (.dt-btn)
  primary: {
    backgroundColor: "rgb(243, 163, 0)", // Orange
    color: "rgb(10, 10, 10)", // Near-black text
    padding: "16px 24px", // Large variant; small: 12px 15px
    borderRadius: "3px",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "20px", // Large variant; small: 16px
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "normal",
    border: "0px solid rgb(243, 163, 0)",
    cursor: "pointer",
  },

  // PRIMARY CTA Small variant
  primarySmall: {
    backgroundColor: "rgb(243, 163, 0)",
    color: "rgb(10, 10, 10)",
    padding: "12px 15px",
    borderRadius: "3px",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "16px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    border: "0px solid rgb(243, 163, 0)",
  },

  // SECONDARY - Dark filled button
  secondary: {
    backgroundColor: "rgb(26, 23, 27)", // Near-black
    color: "rgb(255, 255, 255)", // White text
    padding: "12px 18px",
    borderRadius: "3px",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "16px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    border: "0px solid rgb(243, 163, 0)",
  },

  // SUBMIT BUTTON (booking form) - Large orange
  submit: {
    backgroundColor: "rgb(243, 163, 0)",
    color: "rgb(26, 23, 27)",
    padding: "25px 50px",
    borderRadius: "5px",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "24px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    border: "0px none rgb(26, 23, 27)",
    cursor: "pointer",
  },
} as const;

// =============================================================================
// FOOTER
// =============================================================================

export const FOOTER = {
  wrapper: {
    backgroundImage: `url("${THEME.backgroundImages.woodTexture}")`,
    backgroundSize: "cover",
    backgroundPosition: "50% 0%",
    padding: "0px", // inner widgets add their own padding
    color: "rgb(255, 255, 255)",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "15px",
  },

  // Footer also has a torn paper edge (::before on #footer)
  tornPaperEdge: {
    pseudoBefore: {
      content: '""',
      height: "50px",
      position: "relative" as const,
      top: "0px",
    },
  },

  widgetTitle: {
    fontFamily:
      '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "28px",
    fontWeight: 700,
    color: "rgb(255, 255, 255)",
    textTransform: "uppercase" as const,
    margin: "0px 0px 15px",
  },

  text: {
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontSize: "15px",
    color: "rgb(255, 255, 255)",
    lineHeight: "26px",
  },

  link: {
    color: "rgb(255, 255, 255)",
    fontSize: "15px",
    textDecoration: "none",
  },

  phoneNumber: {
    // Large orange phone number
    fontSize: "38px",
    fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
    fontWeight: 700,
    color: "rgb(243, 163, 0)", // Orange
  },

  // 4-column layout: Anschrift | Kontakt | Mehr Infos | Du hast Fragen?
  columns: 4,
} as const;

// =============================================================================
// PAGE 1: IMPRESSIONEN / DIE FOTOBOX (Gallery)
// =============================================================================

export const PAGE_IMPRESSIONEN = {
  url: "/impressionen/",
  pageTitle: "Die Fotobox",

  gallery: {
    // Uses The7 gallery shortcode with masonry/grid layout
    wrapper: {
      // .dt-css-grid-wrap.mode-grid
      display: "block", // Not CSS grid despite class name; uses JS positioning
      width: "1150px",
      padding: "0px",
      margin: "0px",
    },
    columns: 3, // 3 images per row
    item: {
      // .post.photoswipe-item
      width: "363.328px", // ~1/3 of 1150px minus gaps
      margin: "0px",
      padding: "0px",
      borderRadius: "0px",
    },
    itemCount: 10,
    // Gallery has lightbox (PhotoSwipe) on click
    hoverEffect: "fade", // class: hover-fade, loading-effect-fade-in
  },
} as const;

// =============================================================================
// PAGE 2: PREISE (Pricing)
// =============================================================================

export const PAGE_PREISE = {
  url: "/preise/",
  pageTitle: "Preiskonfigurator",

  priceSection: {
    // Large centered price display
    priceText: {
      // "Unser Preis: 379EUR" - styled as <p> with inline styles
      fontFamily: '"Fira Sans Extra Condensed"',
      fontSize: "45px",
      fontWeight: 800,
      color: "rgb(26, 23, 27)",
      textAlign: "center" as const,
      textTransform: "uppercase" as const,
      lineHeight: "45px",
    },
    subtitle: {
      // "Fotobox mit Drucker" - H2
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "23px",
      fontWeight: 600,
      color: "rgb(243, 163, 0)", // Orange
      textAlign: "center" as const,
      margin: "0px 0px 10px",
    },
    // Decorative spark/star icons flank the price (SVG/image)
  },

  featureGrid: {
    // 3-column grid of features (vc_col-sm-4 = 33.33%)
    columns: 3,
    columnClass: "vc_col-sm-4",

    featureTitle: {
      // H3 elements
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "24px",
      fontWeight: 700,
      color: "rgb(26, 23, 27)",
      textTransform: "none" as const,
      letterSpacing: "normal",
      lineHeight: "26px",
    },

    featureIcon: {
      // Black icon images (SVG/PNG), approximately 60-70px
      display: "inline-block",
    },

    featureDescription: {
      fontFamily: '"Fira Sans"',
      fontSize: "20px", // body default
      color: "rgb(26, 23, 27)",
      lineHeight: "30px",
    },

    features: [
      "Kostenlose Lieferung",
      "Auf und Abbau",
      "Online Galerie",
      "Eigenes Fotolayout",
      "Druckflatrate",
      "24/7 Support",
    ],
  },

  accessoriesSection: {
    // "FOTOBOX ZUBEHOR" heading
    heading: {
      fontSize: "45px",
      fontWeight: 800,
      color: "rgb(26, 23, 27)",
      textAlign: "center" as const,
      textTransform: "uppercase" as const,
    },
    subtitle: {
      fontSize: "23px",
      fontWeight: 600,
      color: "rgb(243, 163, 0)", // Orange
      textAlign: "center" as const,
    },
  },

  // Dark section with package checklist
  darkPackageSection: {
    // "Fotobox mit Drucker" package details
    heading: {
      fontSize: "32px",
      fontWeight: 700,
      color: "rgb(255, 255, 255)",
      textAlign: "center" as const,
      textTransform: "uppercase" as const,
    },
    checklist: {
      fontSize: "18px",
      fontWeight: 700,
      color: "rgb(255, 255, 255)",
      fontFamily: '"Fira Sans"',
    },
  },

  // "Fahrtkosten" section
  travelCostSection: {
    heading: {
      fontSize: "45px",
      fontWeight: 700,
      color: "rgb(26, 23, 27)",
      textAlign: "center" as const,
      textTransform: "uppercase" as const,
    },
  },

  ctaButton: {
    text: "jetzt reservieren",
    href: "/termin-noch-frei-reservieren/",
    ...BUTTONS.primary,
  },
} as const;

// =============================================================================
// PAGE 3: HAEUFIGE FRAGEN (FAQ)
// =============================================================================

export const PAGE_FAQ = {
  url: "/haeufige-fragen/",
  pageTitle: "Haeufige Fragen",

  sectionGroups: {
    // FAQ items are grouped under section headings (H2)
    headings: ["ABLAUF", "AUSDRUCKE & FOTOS"],
    style: {
      fontFamily: '"Fira Sans Extra Condensed"',
      fontSize: "40px",
      fontWeight: 700,
      color: "rgb(26, 23, 27)",
      textTransform: "none" as const,
      margin: "0px 0px 30px",
    },
  },

  accordion: {
    // Rank Math FAQ blocks styled as custom accordions
    totalItems: 11,
    itemWrapper: {
      // .rank-math-list-item
      backgroundColor: "rgb(253, 254, 255)",
      margin: "0px 0px 20px",
      padding: "0px",
      borderRadius: "0px",
    },

    questionBar: {
      // H3.rank-math-question - the clickable dark wood bar
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "24px",
      fontWeight: 700,
      lineHeight: "33.6px",
      color: "rgb(255, 255, 255)",
      textTransform: "uppercase" as const,
      backgroundColor: "rgb(0, 0, 0)", // Fallback
      backgroundImage: `url("${THEME.backgroundImages.woodTexture}")`,
      backgroundSize: "auto",
      backgroundPosition: "0% 0%",
      padding: "17px 56px 17px 48px", // right padding for + icon
      cursor: "pointer",
      borderRadius: "0px",
      // Plus (+) icon on the right side
    },

    answerPanel: {
      // .rank-math-answer
      backgroundColor: "rgb(255, 255, 255)",
      padding: "12px",
      color: "rgb(26, 23, 27)",
      fontSize: "16px",
      fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
      lineHeight: "22.4px",
      display: "none", // Hidden by default, toggled on click
    },
  },
} as const;

// =============================================================================
// PAGE 4: AUDIO-GAESTEBUCH (Audio Guestbook / Gastetelefon)
// =============================================================================

export const PAGE_AUDIO_GUESTBOOK = {
  url: "/audio-gaestebuch-gaestetelefon/",
  pageTitle: "Audio-Gaestebuch / Gaestetelefon",

  heroSection: {
    // First content section: text left, image right (50/50 split)
    layout: "vc_col-sm-6 | vc_col-sm-6",
    columnPadding: "15px",

    heading: {
      // H2 with content subheading
      fontFamily: '"Fira Sans Extra Condensed"',
      fontSize: "30px",
      fontWeight: 800,
      color: "rgb(26, 23, 27)",
      textTransform: "uppercase" as const,
      lineHeight: "35px",
    },

    bodyText: {
      fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "20px",
      color: "rgb(26, 23, 27)",
      lineHeight: "30px",
      fontWeight: 400,
    },

    buttons: [
      {
        text: "jetzt anfragen",
        style: "primary", // Orange filled
        ...BUTTONS.primarySmall,
      },
      {
        text: "Zusammen mit Fotobox buchen",
        style: "secondary", // Dark filled
        ...BUTTONS.secondary,
      },
    ],
  },

  darkSection: {
    // Full-width dark wood section with 2-column layout
    backgroundImage: `url("${THEME.backgroundImages.darkPaperTexture}")`,
    backgroundSize: "1000px 500px",
    backgroundColor: "rgb(102, 102, 102)",

    // Section headings in dark section
    heading: {
      fontFamily:
        '"Fira Sans Extra Condensed", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "35px", // varies
      fontWeight: 800,
      color: "rgb(255, 255, 255)",
      textTransform: "uppercase" as const,
    },

    // Headings with orange highlight words
    orangeHighlight: {
      color: "rgb(243, 163, 0)",
    },

    bodyText: {
      color: "rgb(255, 255, 255)",
      fontSize: "20px",
    },

    // Outline buttons in dark section
    outlineButton: {
      backgroundColor: "transparent",
      color: "rgb(255, 255, 255)",
      border: "2px solid rgb(255, 255, 255)",
      padding: "12px 18px",
      borderRadius: "3px",
      fontSize: "16px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
    },

    bulletList: {
      listStyleType: "disc",
      color: "rgb(255, 255, 255)",
    },
  },

  // Page uses alternating light/dark sections
  // Light sections: paper texture background
  // Dark sections: dark paper texture background with white text
  vcRowCount: 9,
  pageHeight: 5373,
} as const;

// =============================================================================
// PAGE 5: LOVE BUCHSTABEN (LOVE Letters)
// =============================================================================

export const PAGE_LOVE = {
  url: "/love-buchstaben/",
  pageTitle: "XXL LOVE Leuchtbuchstaben",

  heroSection: {
    // Image left (4 cols), text right (8 cols)
    layout: "vc_col-sm-4 | vc_col-sm-8",

    heading: {
      fontFamily: '"Fira Sans Extra Condensed"',
      fontSize: "35px",
      fontWeight: 800,
      color: "rgb(26, 23, 27)",
      textTransform: "uppercase" as const,
      lineHeight: "35px",
    },

    bodyText: {
      fontFamily: '"Fira Sans", Helvetica, Arial, Verdana, sans-serif',
      fontSize: "20px",
      color: "rgb(26, 23, 27)",
      lineHeight: "30px",
    },
  },

  // Alternating sections with image/text in different column arrangements
  sections: [
    { layout: "vc_col-sm-4 | vc_col-sm-8" }, // Image left, text right
    { layout: "vc_col-sm-8 | vc_col-sm-4" }, // Text left, image right
  ],
} as const;

// =============================================================================
// PAGE 6: TERMIN NOCH FREI? (Booking Page)
// =============================================================================

export const PAGE_BOOKING = {
  url: "/termin-noch-frei-reservieren/",
  pageTitle: "Termin noch frei?",

  layout: {
    // Calendar left, form right (roughly 50/50)
    columns: "vc_col-sm-6 | vc_col-sm-6",
  },

  calendar: {
    wrapper: {
      width: "524.297px",
      border: "0px none",
      borderCollapse: "separate" as const,
    },
    monthTitle: {
      fontFamily: '"Fira Sans"',
      fontSize: "20px",
      fontWeight: 400,
      color: "rgb(128, 128, 128)",
      textTransform: "uppercase" as const,
    },
    dayHeader: {
      // MO, DI, MI, DO, FR, SA, SO
      fontFamily: '"Fira Sans"',
      fontSize: "12px",
      fontWeight: 700,
      color: "rgb(255, 255, 255)", // White on dark header row
      textTransform: "uppercase" as const,
      padding: "20px",
      textAlign: "center" as const,
    },
    dayCell: {
      fontSize: "20px",
      fontFamily: '"Fira Sans"',
      fontWeight: 400,
      color: "rgb(26, 23, 27)",
      cursor: "pointer",
      padding: "31.45px 0px",
      textAlign: "center" as const,
    },
    todayHighlight: {
      // Orange circle around today's date
      border: "2px solid rgb(243, 163, 0)",
      borderRadius: "50%",
    },
  },

  form: {
    // Contact Form 7 based
    inputField: {
      backgroundColor: "rgba(0, 0, 0, 0.07)", // Light grey
      border: "0px solid rgb(187, 187, 187)",
      borderRadius: "5px",
      padding: "10px 15px",
      fontFamily: '"Fira Sans"',
      fontSize: "24px",
      color: "rgb(26, 23, 27)",
    },
    textarea: {
      backgroundColor: "rgba(0, 0, 0, 0.07)",
      border: "0px solid rgb(187, 187, 187)",
      borderRadius: "5px",
      padding: "10px 15px",
      fontFamily: '"Fira Sans"',
      fontSize: "24px",
      height: "96px",
    },
    // Toggle switches for event type (Hochzeit, Geburtstag, Firmenevent)
    eventTypeToggles: {
      labels: ["Hochzeit", "Geburtstag", "Firmenevent"],
      labelStyle: {
        fontFamily: '"Fira Sans"',
        fontSize: "20px",
        color: "rgb(26, 23, 27)",
      },
    },
    fields: [
      "Vorname",
      "Nachname",
      "Telefon *",
      "E-Mail *",
      "Veranstaltungsort *",
      "Fragen / Anmerkungen",
    ],
    submitButton: {
      text: "unverbindlich anfragen",
      ...BUTTONS.submit,
      width: "395.359px",
    },
    privacyNote: {
      fontSize: "inherit",
      linkColor: "rgb(243, 163, 0)", // Orange
      linkDecoration: "underline",
    },
  },
} as const;

// =============================================================================
// WPBakery GRID SYSTEM (used across all pages)
// =============================================================================

export const GRID = {
  // WPBakery uses a 12-column float-based grid
  row: {
    width: "1180px",
    margin: "0px -15px",
    display: "block", // float-based, not flexbox
  },
  columns: {
    "vc_col-sm-3": { width: "25%", padding: "0px 15px" },
    "vc_col-sm-4": { width: "33.33%", padding: "0px 15px" },
    "vc_col-sm-6": { width: "50%", padding: "0px 15px" },
    "vc_col-sm-8": { width: "66.66%", padding: "0px 15px" },
    "vc_col-sm-12": { width: "100%", padding: "0px 15px" },
  },
} as const;

// =============================================================================
// RESPONSIVE BEHAVIOR
// =============================================================================

export const RESPONSIVE = {
  // The7 theme uses dt-responsive-on class
  viewportMeta: "width=device-width, initial-scale=1, maximum-scale=10",

  // Key breakpoints used in the theme
  mobile: {
    maxWidth: "768px",
    // Navigation collapses to hamburger menu (floating button)
    // WPBakery columns stack to full width
    // Font sizes scale down
    // Gallery goes to 1-2 columns
  },

  tablet: {
    minWidth: "769px",
    maxWidth: "1024px",
    // Some 3-column layouts become 2-column
    // Content width reduces
  },

  desktop: {
    minWidth: "1025px",
    // Full layout as described above
    // Content width: 1150px
  },

  // Mobile header: fixed position, floating hamburger menu
  mobileHeader: {
    // .dt-mobile-header - shows at mobile breakpoint
    position: "fixed" as const,
    height: "100%",
    // Hamburger icon: .floating-btn
    hamburger: {
      position: "fixed" as const,
      right: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      color: "rgb(243, 163, 0)",
      padding: "10px",
    },
  },
} as const;
