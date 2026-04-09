import type { Metadata } from "next";
import PriceConfiguratorV2 from "@/components/forms/PriceConfiguratorV2";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Preiskonfigurator | Fotobox ab 379€",
  description:
    "Fotobox mieten ab 379€ inkl. Drucker, Auf- & Abbau und Druckflatrate. Stelle Dein Paket zusammen und berechne Deinen individuellen Preis.",
};

export default function PreiseV2Page() {
  return (
    <>
      <PageHeader title="Preiskonfigurator" />
      <PriceConfiguratorV2 />
    </>
  );
}
