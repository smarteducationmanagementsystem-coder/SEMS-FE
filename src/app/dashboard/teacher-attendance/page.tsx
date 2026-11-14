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

export default function Page() {
  return <TeacherAttendancePage />;
}
