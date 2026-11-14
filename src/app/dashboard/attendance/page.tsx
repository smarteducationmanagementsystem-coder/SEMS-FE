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

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <AttendancePage />;
}
