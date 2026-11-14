import type { Metadata } from "next";
import { StudentsPage } from "@/components/institution/students/students";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Students",
  description: "Student admissions, class placement, and guardian profiles.",
  path: `${routes.admin}/students`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <StudentsPage />;
}
