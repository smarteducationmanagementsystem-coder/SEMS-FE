import type { Metadata } from "next";
import { PlatformInstitutions } from "./institutions-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Registered institutions",
  description: "Every institution saved in the database.",
  path: routes.platformInstitutions,
  noIndex: true,
});

export const instant = false;

export default function Page() {
  return <PlatformInstitutions />;
}
