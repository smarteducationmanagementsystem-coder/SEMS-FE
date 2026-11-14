import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Teachers",
  description: "Subject teachers, the classes they take, and the qualifications the office keeps on file.",
  path: routes.teachers,
});

export default function Page() {
  return (
    <CampusModule
      title="Teachers"
      description="Subject teachers, the classes they take, and the qualifications the office keeps on file."
      path={routes.teachers}
      dashboardHref="/dashboard/teachers"
      points={[
            "Each teacher has an employee number, subject, and assigned classes.",
            "Contact details sit next to the classes they mark and examine.",
            "The same record feeds attendance, exams, and result entry.",
      ]}
    />
  );
}
