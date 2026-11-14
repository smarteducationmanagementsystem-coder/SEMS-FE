import type { Metadata } from "next";
import { TeacherAttendancePage } from "@/components/institution/attendance/teacher-attendance";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Staff attendance",
  description: "Record today's in and out time.",
  path: `${routes.admin}/teacher-attendance`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <TeacherAttendancePage />;
}
