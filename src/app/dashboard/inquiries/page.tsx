import type { Metadata } from "next";
import { InquiriesPage } from "@/components/institution/inquiries/inquiries";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Inquiries",
  description: "Demo requests from institutions.",
  path: `${routes.admin}/inquiries`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <InquiriesPage />;
}
