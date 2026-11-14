import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ContentPage } from "@/components/content/content-page";
import { JsonLd } from "@/components/seo/json-ld";
import { faqGroups } from "@/config/faq";
import { buildPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { buildFaqSchema } from "@/lib/structured-data";

const pageTitle = "Frequently asked questions";
const pageDescription = `Answers about ${siteConfig.name}: who the platform is for, roles, fee slips, result cards, reports, and how to request a demo.`;

export const metadata: Metadata = buildPageMetadata({ title: "FAQ", description: pageDescription, path: routes.faq });

export default function FaqPage() {
  const allQuestions = faqGroups.flatMap((group) => group.items);
  return (
    <ContentPage title={pageTitle} path={routes.faq} intro={<p>{pageDescription}</p>}>
      <div className="grid gap-12 lg:grid-cols-12">
        <nav aria-label="FAQ topics" className="hidden lg:col-span-3 lg:block">
          <ul className="sticky top-28 space-y-3 border-l border-stone pl-5 text-sm">
            {faqGroups.map((group) => (
              <li key={group.title}>
                <a href={`#${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-muted hover:text-ink">
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl lg:col-span-9">
          {faqGroups.map((group) => (
            <section key={group.title} id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")} className="mb-12 scroll-mt-28">
              <h2 className="font-display text-3xl sm:text-4xl">{group.title}</h2>
              <div className="mt-4 border-t border-stone">
                {group.items.map((item) => (
                  <details key={item.question} className="group border-b border-stone">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                      <h3>{item.question}</h3>
                      <Plus aria-hidden="true" className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <div className="pb-6 leading-relaxed text-muted">
                      <p>{item.answer}</p>
                      {item.link ? (
                        <Link href={item.link.href} className="mt-3 inline-block text-ink underline underline-offset-4">
                          {item.link.label}
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <JsonLd data={buildFaqSchema(allQuestions)} />
    </ContentPage>
  );
}
