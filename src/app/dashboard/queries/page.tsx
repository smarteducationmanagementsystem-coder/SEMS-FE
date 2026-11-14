import type { Metadata } from "next";
import { StudentQueriesPage } from "@/components/institution/queries/student-queries";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Student queries",
  description: "Students send a subject and message to the institution.",
  path: `${routes.admin}/queries`,
  noIndex: true,
});

export default function Page() {
  return <StudentQueriesPage />;
}
