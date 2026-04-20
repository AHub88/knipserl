import type { Metadata } from "next";
import CityLandingPage, { generateCityMetadata } from "@/components/pages/CityLandingPage";

export const metadata: Metadata = generateCityMetadata("ebersberg");

export default function Page() {
  return <CityLandingPage slug="ebersberg" />;
}
