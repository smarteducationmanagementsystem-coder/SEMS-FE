import type { MetadataRoute } from "next";
import { nonIndexableRoutes } from "@/constants/routes";
import { absoluteUrl } from "@/lib/structured-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [...nonIndexableRoutes] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
