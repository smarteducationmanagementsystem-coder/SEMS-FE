import type { Metadata } from "next";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";
import { PlatformPricingPage } from "./pricing-page";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description: "Edit the public pricing cards and the payment account.",
  path: routes.platformPricing,
  noIndex: true,
});

export default function Page() {
  return <PlatformPricingPage />;
}
