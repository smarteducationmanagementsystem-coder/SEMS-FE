import type { Metadata } from "next";
import { PlatformEmail } from "./email-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Sending email",
  description: "Email one institution or every institution.",
  path: routes.platformEmail,
  noIndex: true,
});

export const instant = false;

export default function Page() {
  return <PlatformEmail />;
}
