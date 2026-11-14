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

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <AcademicsPage />;
}
