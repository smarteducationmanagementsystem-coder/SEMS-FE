import type { Metadata } from "next";
import { StaffPage } from "@/components/institution/staff/staff";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Staff",
  description: "Non-teaching staff profiles and employment details.",
  path: `${routes.admin}/staff`,
  noIndex: true,
});

export default function Page() {
  return <StaffPage />;
}
