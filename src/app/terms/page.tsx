import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { PolicyContent } from "@/components/content/policy-content";
import { termsPolicy } from "@/config/policies";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: termsPolicy.title,
  description: termsPolicy.summary,
  path: routes.terms,
});

export default function TermsPage() {
  return (
    <ContentPage title={termsPolicy.title} path={routes.terms} intro={<p>{termsPolicy.summary}</p>}>
      <PolicyContent policy={termsPolicy} />
    </ContentPage>
  );
}
