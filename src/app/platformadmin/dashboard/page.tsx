import type { Metadata } from "next";
import { PlatformDashboard } from "./dashboard-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Platform dashboard",
  description: "Institution, people, and payment totals.",
  path: routes.platformDashboard,
  noIndex: true,
});

export default function Page() {
  return <PlatformDashboard />;
}
