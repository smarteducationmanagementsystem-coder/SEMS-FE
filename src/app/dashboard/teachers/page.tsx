import type { Metadata } from "next";
import { TeachersPage } from "@/components/institution/teachers/teachers";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Teachers",
  description: "Teacher profiles, subjects, and class assignments.",
  path: `${routes.admin}/teachers`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <TeachersPage />;
}
