import type { Metadata } from "next";
import { ExamsPage } from "@/components/institution/exams/exams";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Exam sitting plan",
  description: "Room and seat plan for a class examination.",
  path: `${routes.admin}/exams`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <ExamsPage />;
}
