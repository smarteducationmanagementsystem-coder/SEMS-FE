import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Reports",
  description: "Attendance, fee, and performance reports for a month, session, class, or student.",
  path: routes.reports,
});

export default function Page() {
  return (
    <CampusModule
      title="Reports"
      description="Attendance, fee, and performance reports for a month, session, class, or student."
      path={routes.reports}
      dashboardHref="/dashboard/reports"
      points={[
            "Filter a report before it is printed or downloaded.",
            "Fee, attendance, and result numbers come from the same campus records.",
            "Export a spreadsheet or open a print-ready page.",
      ]}
    />
  );
}
