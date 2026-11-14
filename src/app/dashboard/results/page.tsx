import type { Metadata } from "next";
import { ResultsPage } from "@/components/institution/results/results";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Results",
  description: "Grades, percentages, positions, and printable result cards.",
  path: `${routes.admin}/results`,
  noIndex: true,
});

/** Campus session is client-only, so this page is outside the logged-out shell. */
export const instant = false;

export default function Page() {
  return <ResultsPage />;
}
