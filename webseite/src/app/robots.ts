import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const isProduction = !(
  process.env.SITE_ENV === "staging" ||
  process.env.NEXT_PUBLIC_ENV === "staging" ||
  (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("www.knipserl.de"))
);

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
