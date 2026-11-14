import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";
import { PolicyContent } from "@/components/content/policy-content";
import { privacyPolicy } from "@/config/policies";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

export const metadata: Metadata = buildPageMetadata({
  title: privacyPolicy.title,
  description: privacyPolicy.summary,
  path: routes.privacy,
});

export default function PrivacyPage() {
  return (
    <ContentPage title={privacyPolicy.title} path={routes.privacy} intro={<p>{privacyPolicy.summary}</p>}>
      <PolicyContent policy={privacyPolicy} />
    </ContentPage>
  );
}
