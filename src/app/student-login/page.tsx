import type { Metadata } from "next";
import { PortalLogin } from "@/components/institution/signup/portal-login";
import { AdminShell } from "@/components/institution/shell/campus-shell";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Student portal",
  description: "Student sign-in for the institution where the student was admitted.",
  path: routes.studentLogin,
  noIndex: true,
});

export default function Page() {
  return (
    <AdminShell>
      <PortalLogin kind="student" />
    </AdminShell>
  );
}
