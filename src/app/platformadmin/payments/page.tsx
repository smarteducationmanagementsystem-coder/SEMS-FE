import type { Metadata } from "next";
import { PlatformPayments } from "./payments-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment marked",
  description: "Mark each institution paid or unpaid for the current month.",
  path: routes.platformPayments,
  noIndex: true,
});

export const instant = false;

export default function Page() {
  return <PlatformPayments />;
}
