import type { Metadata } from "next";
import { ViewStaffAttendancePage } from "@/components/institution/attendance/view-staff-attendance";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "View staff attendance",
  description: "Monthly in and out times for every teacher.",
  path: `${routes.admin}/staff-attendance`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <ViewStaffAttendancePage />;
}
