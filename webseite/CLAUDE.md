@AGENTS.md

# Knipserl Website v2 — Next.js Rebuild

Rebuild of www.knipserl.de from WordPress to Next.js 16 (App Router, TypeScript, Tailwind CSS).

## Project Context

- **Business:** Knipserl Fotobox — photo booth rental service in Oberbayern/Tirol
- **Goal:** Modernize from WordPress, prepare for Strapi CMS and admin dashboard integration
- **Hosting:** Own Hetzner server (shared with other clients)
- **Email:** Microsoft Graph API (O365/Azure)
- **Maps:** DSGVO-compliant open-source only (OpenRouteService/Nominatim), NOT Google Maps
- **Inquiries:** Will eventually land in a separate admin dashboard (different repo)

## Design Reference — knipserl.de

The design must match the existing www.knipserl.de as closely as possible.

### Brand Design System

**Colors:**
- Accent/CTA: `#F3A300` (orange)
- Accent hover: `#d99200`
- Base dark: `#1a171b`
- Body text: `#666666`
- White: `#ffffff`

**Fonts:**
- Body: `"Fira Sans", Helvetica, Arial, Verdana, sans-serif` — 20px/30px, weight 400
- Headings (H1-H6): `"Fira Sans Extra Condensed"` — uppercase, weight 800, letter-spacing 0.02em
- Hero cursive: `"Beyond The Mountains"` (local font in `/public/fonts/`)

**Navigation (Desktop):**
- Font: Fira Sans Extra Condensed, 21px, line-height 25px, bold, uppercase
- Color: `#1a171b`, hover `#F3A300`
- "Termin prüfen" button: dark bg, white text, rounded-md

**Buttons (3 variants defined in globals.css):**
- `.btn-brand` — orange bg, dark text, 22px, uppercase, border-radius 6px
- `.btn-outline` — transparent, white border, 22px, uppercase
- `.btn-outline-dark` — transparent, dark border, 22px, uppercase

**Backgrounds:**
- Body: `main_back.webp` (paper texture, repeat, 1000x500px)
- Dark sections: `main_back_gr-2.webp` (dark texture)
- Subpage header: `fancy-header.jpg` (wood texture, 180px height)
- Footer: `footer-bg.jpg` (dark wood)

**Decorative Elements:**
- Torn paper edges: `.rough-top` / `.rough-bottom` pseudo-elements (50px height, repeat-x)
- Heading sparkles: `.heading-decorated` with left/right spark PNGs
- IMPORTANT: `.rough-bottom` sets `position: relative` — never apply directly to `position: fixed` elements

### Header Behavior

- **Homepage:** Fixed, transparent over hero image. Becomes white+shadow on scroll (>50px). Logo 250px initially, shrinks to 160px when scrolled. Top padding 30px (desktop).
- **Subpages:** Fixed, always white+shadow. Logo 160px. Uses `usePathname()` to detect.
- **Scrolled/Subpage state:** Shows torn paper edge via a positioned div (not `.rough-bottom` class, which would override `position: fixed`).
- **Mobile:** "MENÜ" text + hamburger icon. Slide-in panel from right (white bg, 300px).

### Subpage PageHeader Component

Located at `src/components/layout/PageHeader.tsx`. Uses `fancy-header.jpg` background, 180px height, small title text (20px, Fira Sans, normal weight, no uppercase).

## SEO Priority

SEO/GEO optimization is the **#1 priority** — organic local search is the primary customer acquisition channel.

- Every page: meta tags, structured data (JSON-LD), OpenGraph
- LocalBusiness + Service schema markup
- Geo-targeted landing pages (Rosenheim, München, Ebersberg, etc.)
- FAQ schema on FAQ page
- Proper heading hierarchy, image alt texts with geo keywords
- sitemap.xml, robots.txt, canonical URLs
- Next.js SSG for page speed

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Homepage with hero, CTA bar, features, gallery, logos
    preise/               # Pricing + configurator
    impressionen/         # Gallery
    haeufige-fragen/      # FAQ with accordions
    audio-gaestebuch/     # Audio guestbook product page
    love-buchstaben/      # LOVE letters product page
    termin-reservieren/   # Booking form
    kontakt/              # Contact page
    fotobox/[city]/       # SEO landing pages per city
    impressum/            # Legal
    datenschutzerklaerung/
    globals.css           # Global styles, button classes, torn edges, sparkles
  components/
    layout/
      Header.tsx          # Client component with scroll + pathname detection
      Footer.tsx          # Wood texture footer with schema markup
      PageHeader.tsx      # Subpage header with fancy-header.jpg
    forms/
      InquiryForm.tsx     # Contact/inquiry form
      PriceConfigurator.tsx # Interactive pricing calculator
  lib/
    constants.ts          # Business data, pricing, addons, cities
    seo.ts                # Schema.org generators, meta helpers
    distance.ts           # GDPR-compliant distance calculation (OSM/OSRM)
public/
  images/                 # All images migrated from WordPress
  fonts/                  # Beyond The Mountains font
```

## Current Status

- Homepage design mostly matches original (hero, CTA bar, features, gallery, logos, footer)
- All subpages have PageHeader + brand styling but need pixel-perfect refinement against original
- Mobile responsive work in progress
- Sticky header working on homepage, subpages use solid white header
