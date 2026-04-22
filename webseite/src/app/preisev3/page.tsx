import type { Metadata } from "next";
import PriceConfiguratorV3 from "@/components/forms/PriceConfiguratorV3";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Preiskonfigurator V3 | Fotobox ab 379€",
  description:
    "Fotobox mieten ab 379€ inkl. Drucker, Auf- & Abbau und Druckpaket. Stelle Dein Paket zusammen und berechne Deinen individuellen Preis.",
  robots: { index: false, follow: false },
};

export default function PreiseV3Page() {
  return (
    <>
      <PageHeader title="Preiskonfigurator" />
      <PriceConfiguratorV3 />
    </>
  );
}
