import type { Metadata } from "next";
import { siteConfig } from "./site";

export const seoConfig = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: siteConfig.name,
  defaultDescription: siteConfig.description,
  keywords: [
    "education management system",
    "school management software",
    "student attendance",
    "fee management",
    "exam results",
    "college administration",
    "Smart Education Management System",
  ],
  defaultOgImage: {
    url: siteConfig.logo.imagePath,
    alt: siteConfig.logo.alt,
  },
  twitterHandle: "@smarteducation",
} as const;

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string };
  noIndex?: boolean;
}

/**
 * Builds consistent per-page metadata: canonical URL, Open Graph and Twitter
 * cards all point at the same title, description and image.
 */
export function buildPageMetadata({ title, description, path, image, noIndex = false }: PageMetadataOptions): Metadata {
  const ogImage = image ? { url: image.url, alt: image.alt } : seoConfig.defaultOgImage;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}
