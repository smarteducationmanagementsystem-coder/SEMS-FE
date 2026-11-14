import type { Metadata } from "next";
import { AcademicsPage } from "@/components/institution/academics/academics";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Academics",
  description: "Classes, subjects, and the weekly timetable.",
  path: `${routes.admin}/academics`,
  noIndex: true,
});

export default function Page() {
  return <AcademicsPage />;
}
