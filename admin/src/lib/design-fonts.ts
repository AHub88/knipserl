export const DESIGN_FONTS = [
  // Display / Dekorativ
  { family: "Abril Fatface", category: "display", weights: [400] },
  { family: "Alfa Slab One", category: "display", weights: [400] },
  { family: "Comfortaa", category: "display", weights: [400, 700] },
  { family: "Fredoka One", category: "display", weights: [400] },
  { family: "Germania One", category: "display", weights: [400] },
  { family: "Lobster", category: "display", weights: [400] },
  { family: "Permanent Marker", category: "display", weights: [400] },
  { family: "Righteous", category: "display", weights: [400] },
  { family: "UnifrakturCook", category: "display", weights: [700] },

  // Script / Handschrift
  { family: "Alex Brush", category: "handwriting", weights: [400] },
  { family: "Allura", category: "handwriting", weights: [400] },
  { family: "Bad Script", category: "handwriting", weights: [400] },
  { family: "Caveat", category: "handwriting", weights: [400, 700] },
  { family: "Dancing Script", category: "handwriting", weights: [400, 700] },
  { family: "Great Vibes", category: "handwriting", weights: [400] },
  { family: "Pacifico", category: "handwriting", weights: [400] },
  { family: "Parisienne", category: "handwriting", weights: [400] },
  { family: "Pinyon Script", category: "handwriting", weights: [400] },
  { family: "Sacramento", category: "handwriting", weights: [400] },
  { family: "Satisfy", category: "handwriting", weights: [400] },
  { family: "Style Script", category: "handwriting", weights: [400] },
  { family: "Tangerine", category: "handwriting", weights: [400, 700] },

  // Sans-Serif
  { family: "Josefin Sans", category: "sans-serif", weights: [400, 600, 700] },
  { family: "Lato", category: "sans-serif", weights: [400, 700] },
  { family: "Montserrat", category: "sans-serif", weights: [400, 600, 700] },
  { family: "Open Sans", category: "sans-serif", weights: [400, 600, 700] },
  { family: "Oswald", category: "sans-serif", weights: [400, 700] },
  { family: "Poppins", category: "sans-serif", weights: [400, 600, 700] },
  { family: "Raleway", category: "sans-serif", weights: [400, 600, 700] },
  { family: "Roboto", category: "sans-serif", weights: [400, 700] },

  // Serif / Elegant
  { family: "Bodoni Moda", category: "serif", weights: [400, 700] },
  { family: "Cinzel", category: "serif", weights: [400, 700] },
  { family: "Cormorant Garamond", category: "serif", weights: [400, 600, 700] },
  { family: "Crimson Text", category: "serif", weights: [400, 700] },
  { family: "EB Garamond", category: "serif", weights: [400, 700] },
  { family: "Libre Baskerville", category: "serif", weights: [400, 700] },
  { family: "Lora", category: "serif", weights: [400, 700] },
  { family: "Playfair Display", category: "serif", weights: [400, 700] },
] as const;

export type DesignFont = (typeof DESIGN_FONTS)[number];

export const FONT_CATEGORIES = [
  { key: "handwriting", label: "Handschrift" },
  { key: "serif", label: "Serif" },
  { key: "sans-serif", label: "Sans-Serif" },
  { key: "display", label: "Display" },
] as const;
