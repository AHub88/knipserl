import type { Metadata } from "next";
import CityLandingPage, { generateCityMetadata } from "@/components/pages/CityLandingPage";

export const metadata: Metadata = generateCityMetadata("kufstein");

// Force dynamic: fetch aus Admin bei jedem Request, keine statische Vorberechnung
export const dynamic = "force-dynamic";

export default function Page() {
  return <CityLandingPage slug="kufstein" />;
}
