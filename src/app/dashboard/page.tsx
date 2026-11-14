import type { Metadata } from "next";
import { DashboardPage } from "@/components/institution/dashboard/dashboard";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard",
  description: "Campus dashboard for students, attendance, fees, and academic performance.",
  path: routes.admin,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <DashboardPage />;
}
