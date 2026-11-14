import type { Metadata } from "next";
import { AttendancePage } from "@/components/institution/attendance/attendance";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Student attendance",
  description: "Daily student attendance and monthly attendance history.",
  path: `${routes.admin}/attendance`,
  noIndex: true,
});

export default function Page() {
  return <AttendancePage />;
}
