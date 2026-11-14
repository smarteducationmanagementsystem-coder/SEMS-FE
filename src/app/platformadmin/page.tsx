import type { Metadata } from "next";
import { PlatformLogin } from "./platform-login";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Platform admin",
  description: "Sign in to manage every registered institution.",
  path: routes.platformAdmin,
  noIndex: true,
});

export const instant = false;

export default function Page() {
  return <PlatformLogin />;
}
