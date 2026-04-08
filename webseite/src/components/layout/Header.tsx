"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/constants";

const navItems = [
  { label: "Die Fotobox", href: "/impressionen" },
  { label: "Preise", href: "/preise" },
  {
    label: "Extras",
    children: [
      { label: "Gästetelefon", href: "/audio-gaestebuch" },
      { label: "LOVE Buchstaben", href: "/love-buchstaben" },
    ],
  },
  { label: "FAQ", href: "/haeufige-fragen" },
  { label: "WhatsApp Anfrage", href: WHATSAPP_URL, external: true },
  { label: "Termin prüfen", href: "/termin-reservieren", highlight: true },
];

const navLinkClass = "px-4 py-2 font-bold text-[21px] leading-[25px] uppercase font-[family-name:var(--font-fira-condensed)] transition-colors text-[#1a171b] hover:text-[#F3A300]";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On subpages: always white bg, smaller logo, with paper edge
  // On homepage: transparent initially, white on scroll
  const showSolid = !isHome || scrolled;

  return (
    <>
      {/* Main header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolid
            ? "bg-white shadow-md"
            : "bg-transparent pt-[15px] lg:pt-[30px]"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 flex items-center justify-between h-[70px] md:h-[70px] lg:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <Image
              src="/images/logo/knipserl-logo.png"
              alt="Knipserl Fotobox - Fotobox mieten in Oberbayern und Tirol"
              width={160}
              height={53}
              priority
              className={`${showSolid ? "w-[160px]" : "w-[250px]"} h-auto transition-all duration-300`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto" aria-label="Hauptnavigation">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <button
                    className={navLinkClass}
                  >
                    {item.label}
                    <svg className="w-3 h-3 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all bg-white shadow-lg py-2 min-w-[220px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-3 text-[#3c3e45] hover:text-[#F3A300] hover:bg-gray-50 transition-colors text-[16px] leading-[20px] uppercase font-normal font-[family-name:var(--font-fira-condensed)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={
                    item.highlight
                      ? "ml-3 px-6 py-3 bg-[#1a171b] text-white font-bold text-[21px] leading-[25px] uppercase font-[family-name:var(--font-fira-condensed)] tracking-wider rounded-md hover:bg-[#333] transition-colors"
                      : navLinkClass
                  }
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center gap-2 p-2 text-[#1a171b]"
            aria-label="Menü öffnen"
          >
            <span className="text-[18px] font-bold uppercase font-[family-name:var(--font-fira-condensed)]">Menü</span>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Torn paper edge when solid header — z-[-1] so content beneath shows through the transparent rips */}
        {scrolled && (
          <div
            className="absolute left-0 w-full pointer-events-none"
            style={{
              top: "30px",
              height: "80px",
              zIndex: -1,
              background: "url('/images/misc/rough-top-clean.png') repeat-x center top",
              backgroundSize: "auto 80px",
            }}
          />
        )}
      </header>

      {/* Mobile slide-in overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" aria-label="Mobile Navigation">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />

          {/* Slide-in panel */}
          <nav className="absolute top-0 right-0 w-[300px] h-full bg-white shadow-2xl overflow-y-auto">
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-[#F3A300] rounded-sm text-white"
                aria-label="Menü schließen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <div className="px-6 space-y-0">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="block py-4 text-[#F3A300] font-bold text-[16px] uppercase font-[family-name:var(--font-fira-condensed)] border-b border-gray-200"
              >
                Startseite
              </Link>
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="border-b border-gray-200">
                    <button
                      onClick={() => setExtrasOpen(!extrasOpen)}
                      className="w-full text-left py-4 text-[#1a171b] font-bold text-[16px] uppercase font-[family-name:var(--font-fira-condensed)] flex justify-between items-center"
                    >
                      {item.label}
                      <span className="text-gray-400 text-[20px]">{extrasOpen ? "−" : "+"}</span>
                    </button>
                    {extrasOpen && (
                      <div className="pb-3 space-y-0">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 pl-4 text-[#1a171b] text-[15px] uppercase font-[family-name:var(--font-fira-condensed)] hover:text-[#F3A300]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="block py-4 text-[#1a171b] font-bold text-[16px] uppercase font-[family-name:var(--font-fira-condensed)] border-b border-gray-200 hover:text-[#F3A300]"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>

            {/* Contact info */}
            <div className="px-6 mt-6 space-y-3 text-[14px] text-[#1a171b]">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-[#F3A300]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {CONTACT_EMAIL}
              </a>
              <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-2 hover:text-[#F3A300]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
