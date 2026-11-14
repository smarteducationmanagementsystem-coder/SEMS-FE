import type { Metadata } from "next";
import { StudentDetailPage } from "@/components/institution/students/student-detail";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Student profile",
  description: "Personal details, academic history, attendance, and fee records for one student.",
  path: `${routes.admin}/students`,
  noIndex: true,
});

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailPage id={id} />;
}
