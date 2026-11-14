import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Examinations",
  description: "Exam schedules, subjects, and the marks teachers enter for each paper.",
  path: routes.exams,
});

export default function Page() {
  return (
    <CampusModule
      title="Examinations"
      description="Exam schedules, subjects, and the marks teachers enter for each paper."
      path={routes.exams}
      dashboardHref="/dashboard/exams"
      points={[
            "Create an exam for a class and session, with a date and subjects.",
            "Teachers enter marks against the students in that class.",
            "Removing an exam clears the marks that belonged to it.",
      ]}
    />
  );
}
