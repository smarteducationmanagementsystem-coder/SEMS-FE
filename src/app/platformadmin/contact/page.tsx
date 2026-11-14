import type { Metadata } from "next";
import { PlatformContact } from "./contact-page";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact us",
  description: "Messages sent from the public contact page.",
  path: routes.platformContact,
  noIndex: true,
});

export default function Page() {
  return <PlatformContact />;
}
