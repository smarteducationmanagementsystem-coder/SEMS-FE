import type { MetadataRoute } from "next";
import { routes } from "@/constants/routes";
import { absoluteUrl } from "@/lib/structured-data";

/** Lists every indexable public page. The campus dashboard is excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: routes.home, priority: 1, changeFrequency: "weekly" as const },
    { path: routes.students, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.teachers, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.staff, priority: 0.7, changeFrequency: "monthly" as const },
    { path: routes.fees, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.attendance, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.exams, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.results, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.reports, priority: 0.8, changeFrequency: "monthly" as const },
    { path: routes.service, priority: 0.7, changeFrequency: "monthly" as const },
    { path: routes.pricing, priority: 0.7, changeFrequency: "monthly" as const },
    { path: routes.about, priority: 0.6, changeFrequency: "monthly" as const },
    { path: routes.faq, priority: 0.6, changeFrequency: "monthly" as const },
    { path: routes.contact, priority: 0.5, changeFrequency: "monthly" as const },
    { path: routes.privacy, priority: 0.2, changeFrequency: "yearly" as const },
    { path: routes.terms, priority: 0.2, changeFrequency: "yearly" as const },
  ];

  return staticPages.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
