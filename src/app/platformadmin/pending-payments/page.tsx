import type { Metadata } from "next";
import { PlatformPendingPayments } from "../pending/pending-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Pending payment",
  description: "Institutions that have not paid for the current month.",
  path: routes.platformPending,
  noIndex: true,
});

export const instant = false;

export default function Page() {
  return <PlatformPendingPayments />;
}
