import type { Metadata } from "next";
import { InstitutionLogin } from "@/components/institution/signup/institution-login";
import { AdminShell } from "@/components/institution/shell/campus-shell";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Login",
  description: "Sign in to an institution campus dashboard.",
  path: routes.login,
  noIndex: true,
});

export default function Page() {
  return (
    <AdminShell>
      <InstitutionLogin />
    </AdminShell>
  );
}
