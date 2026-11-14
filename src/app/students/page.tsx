import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Students",
  description: "Admissions, class placement, guardians, and a student profile that stays current through the year.",
  path: routes.students,
});

export default function Page() {
  return (
    <CampusModule
      title="Students"
      description="Admissions, class placement, guardians, and a student profile that stays current through the year."
      path={routes.students}
      dashboardHref="/dashboard/students"
      points={[
            "Admission number, class, section, and academic session on one profile.",
            "Guardian name and phone stay with the student, not in a separate register.",
            "Active and inactive status shows who is still on the campus roll.",
      ]}
    />
  );
}
