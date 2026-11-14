import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Attendance",
  description: "Daily present, absent, late, and leave marks for students, then a monthly percentage.",
  path: routes.attendance,
});

export default function Page() {
  return (
    <CampusModule
      title="Attendance"
      description="Daily present, absent, late, and leave marks for students, then a monthly percentage."
      path={routes.attendance}
      dashboardHref="/dashboard/attendance"
      points={[
            "Mark a whole class for one date, then review the month.",
            "Teachers see their class. Parents and students see their own rows.",
            "Staff attendance uses the same register, kept apart from students.",
      ]}
    />
  );
}
