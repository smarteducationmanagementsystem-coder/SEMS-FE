import type { Metadata } from "next";
import { RolesPage } from "@/components/institution/roles/roles";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Roles",
  description: "Role-based access for admins, teachers, accountants, students, and parents.",
  path: `${routes.admin}/roles`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <RolesPage />;
}
