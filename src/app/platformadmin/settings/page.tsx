import type { Metadata } from "next";
import { PlatformSettings } from "./settings-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Setting",
  description: "Update the platform admin email and password.",
  path: routes.platformSettings,
  noIndex: true,
});

export default function Page() {
  return <PlatformSettings />;
}
