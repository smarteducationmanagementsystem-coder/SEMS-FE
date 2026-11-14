import type { Metadata } from "next";
import { HiringPage } from "@/components/institution/hiring/hiring";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Hiring staff",
  description: "Teachers waiting for a class, with a subject filter.",
  path: `${routes.admin}/hiring`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <HiringPage />;
}
