import type { Metadata } from "next";
import { InstitutionsPage } from "@/components/institution/institutions/institutions";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Institutions",
  description: "Institutions registered on Smart Education Management System.",
  path: `${routes.admin}/institutions`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <InstitutionsPage />;
}
