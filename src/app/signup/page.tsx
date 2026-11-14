import type { Metadata } from "next";
import { InstitutionSignup } from "@/components/institution/signup/institution-signup";
import { AdminShell } from "@/components/institution/shell/campus-shell";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Signup",
  description: "Register an institution and open its campus dashboard.",
  path: routes.signup,
  noIndex: true,
});

export default function Page() {
  return (
    <AdminShell>
      <InstitutionSignup />
    </AdminShell>
  );
}
