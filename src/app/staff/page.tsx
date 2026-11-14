import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Staff",
  description: "Non-teaching staff who run the office, accounts desk, and campus support.",
  path: routes.staff,
});

export default function Page() {
  return (
    <CampusModule
      title="Staff"
      description="Non-teaching staff who run the office, accounts desk, and campus support."
      path={routes.staff}
      dashboardHref="/dashboard/staff"
      points={[
            "Departments, joining dates, and employment status in one list.",
            "Staff attendance is kept separate from the student register.",
            "Institution admins can add, update, or remove a staff profile.",
      ]}
    />
  );
}
