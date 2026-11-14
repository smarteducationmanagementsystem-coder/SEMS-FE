import type { Metadata } from "next";
import { CampusModule } from "@/components/home/campus-module";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Fees",
  description: "Class fee structures, monthly challans, partial payments, and what is still outstanding.",
  path: routes.fees,
});

export default function Page() {
  return (
    <CampusModule
      title="Fees"
      description="Class fee structures, monthly challans, partial payments, and what is still outstanding."
      path={routes.fees}
      dashboardHref="/dashboard/fees"
      points={[
            "Tuition, transport, and lab charges follow the class structure.",
            "Discounts and late fees adjust a challan without a second spreadsheet.",
            "Collected and pending amounts stay visible for the accountant and the parent.",
      ]}
    />
  );
}
