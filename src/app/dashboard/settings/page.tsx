import type { Metadata } from "next";
import { SettingsPage } from "@/components/institution/settings/settings";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Settings",
  description: "Institution profile, fee rules, and notification preferences.",
  path: `${routes.admin}/settings`,
  noIndex: true,
});

export default function Page() {
  return <SettingsPage />;
}
