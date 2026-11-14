/**
 * Single source of truth for the project name and contact details.
 * Every component that shows the brand name, tagline or contact info reads from here.
 */

const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Smart Education Management System",
  legalName: "Smart Education Management System",
  tagline: "Campus, clarified.",
  shortDescription: "A campus system for schools, colleges, and academies.",
  description:
    "Smart Education Management System gives schools, colleges, and academies one place to run admissions, attendance, fees, examinations, results, and monthly performance reports.",
  /** Public origin of the site, used for canonical URLs, sitemap and structured data. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, ""),
  locale: "en_PK",
  language: "en",
  country: "PK",
  logo: {
    imagePath: "/visha-logo.svg",
    alt: "Smart Education Management System",
  },
  contact: {
    email: "hello@smarteducation.example",
    phone: "+92 300 555 0142",
    whatsapp: "+92 300 555 0142",
    city: "Lahore, Pakistan",
    supportHours: "Monday to Saturday, 9am to 6pm PKT",
    isPlaceholder: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
