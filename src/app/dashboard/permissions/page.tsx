import type { Metadata } from "next";
import { PermissionsPage } from "@/components/institution/permissions/permissions";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Permissions",
  description: "Choose which portal pages teachers and students can open.",
  path: `${routes.admin}/permissions`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <PermissionsPage />;
}
