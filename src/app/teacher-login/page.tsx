import type { Metadata } from "next";
import { PortalLogin } from "@/components/institution/signup/portal-login";
import { AdminShell } from "@/components/institution/shell/campus-shell";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Teacher login",
  description: "Teacher sign-in for the institution where the teacher was added.",
  path: routes.teacherLogin,
  noIndex: true,
});

export default function Page() {
  return (
    <AdminShell>
      <PortalLogin kind="teacher" />
    </AdminShell>
  );
}
