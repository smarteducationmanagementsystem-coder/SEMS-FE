import Link from "next/link";
import { PlaceholderNotice } from "@/components/ui/placeholder-notice";
import type { PolicyPage } from "@/config/policies";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

const lastUpdatedFormatter = new Intl.DateTimeFormat("en-PK", { dateStyle: "long", timeZone: "UTC" });

/** Renders a policy from config with a sticky section index on desktop. */
export function PolicyContent({ policy }: { policy: PolicyPage }) {
  const sectionId = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
        <ul className="sticky top-28 space-y-3 border-l border-stone pl-5 text-sm">
          {policy.sections.map((section) => (
            <li key={section.heading}>
              <a href={`#${sectionId(section.heading)}`} className="text-muted transition-colors hover:text-ink">
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <article className="max-w-2xl lg:col-span-8">
        {policy.isPlaceholder ? (
          <PlaceholderNotice className="mb-10">
            Placeholder policy — this text has not been confirmed by {siteConfig.name} yet and will be replaced before launch.
          </PlaceholderNotice>
        ) : null}
        {policy.sections.map((section) => (
          <section key={section.heading} id={sectionId(section.heading)} className="scroll-mt-28 border-t border-stone py-8 first-of-type:border-t-0 first-of-type:pt-0">
            <h2 className="font-display text-3xl">{section.heading}</h2>
            <div className="mt-4 space-y-3 leading-relaxed text-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-6 border-t border-stone pt-6 text-sm text-muted">
          Last updated {lastUpdatedFormatter.format(new Date(policy.lastUpdated))}. Questions?{" "}
          <Link href={routes.contact} className="text-ink underline underline-offset-4">
            Contact us
          </Link>
          .
        </p>
      </article>
    </div>
  );
}
