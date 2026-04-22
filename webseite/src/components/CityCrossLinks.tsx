import Link from "next/link";
import { SEO_CITIES, cityUrlPath } from "@/lib/constants";

export default function CityCrossLinks({ occasionLabel }: { occasionLabel: string }) {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
          Fotobox für {occasionLabel} in Deiner Region
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {SEO_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={cityUrlPath(city.slug)}
              className="px-5 py-2.5 text-[14px] font-[family-name:var(--font-fira-condensed)] uppercase font-bold tracking-[0.02em] hover:text-[#F3A300] transition-colors"
              style={{
                background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat",
                backgroundSize: "1000px 500px",
                color: "white",
              }}
            >
              Fotobox {city.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
