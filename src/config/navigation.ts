import { routes } from "@/constants/routes";

export interface NavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface FooterLinkGroup {
  title: string;
  links: NavigationLink[];
}

/** Primary header navigation. */
export const mainNavigation: NavigationLink[] = [
  { label: "Home", href: routes.home },
  { label: "Service", href: routes.service },
  { label: "Pricing", href: routes.pricing },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

export const footerNavigation: FooterLinkGroup[] = [
  {
    title: "Quick links",
    links: [
      { label: "Service", href: routes.service },
      { label: "Pricing", href: routes.pricing },
    ],
  },
  {
    title: "Institution",
    links: [
      { label: "About", href: routes.about },
      { label: "FAQ", href: routes.faq },
      { label: "Request a demo", href: routes.contact },
    ],
  },
];

export const legalNavigation: NavigationLink[] = [
  { label: "Privacy policy", href: routes.privacy },
  { label: "Terms & conditions", href: routes.terms },
];
