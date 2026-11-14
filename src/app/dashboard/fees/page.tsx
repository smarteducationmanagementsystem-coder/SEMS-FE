import type { Metadata } from "next";
import { FeesPage } from "@/components/institution/fees/fees";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Fees",
  description: "Fee challans, payments, discounts, and class fee structures.",
  path: `${routes.admin}/fees`,
  noIndex: true,
});

export default function Page() {
  return <FeesPage />;
}
