import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Results",
  description: "Percentages, grades, class positions, and a result card the office can print.",
  path: routes.results,
});

export default function Page() {
  return (
    <CampusModule
      title="Results"
      description="Percentages, grades, class positions, and a result card the office can print."
      path={routes.results}
      dashboardHref="/dashboard/results"
      points={[
            "Marks become a percentage, grade, and position for the class.",
            "A result card prints with the institution name and the exam.",
            "Students and parents see published results for their own record.",
      ]}
    />
  );
}
