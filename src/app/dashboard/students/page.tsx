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

export default function Page() {
  return <StudentsPage />;
}
