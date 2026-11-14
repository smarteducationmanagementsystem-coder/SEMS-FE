import type { Metadata } from "next";
import { ReportsPage } from "@/components/institution/reports/reports";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Reports",
  description: "Attendance, fee, and performance reports with PDF and spreadsheet export.",
  path: `${routes.admin}/reports`,
  noIndex: true,
});

export default function Page() {
  return <ReportsPage />;
}
