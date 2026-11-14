import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import StrengthBell from "@/components/animation/StrengthBell";
import { buildPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

const pageDescription = `Request a demo of ${siteConfig.name} or ask about students, fees, attendance, and results for your institution.`;

export const metadata: Metadata = buildPageMetadata({ title: "Contact us", description: pageDescription, path: routes.contact });

export default function ContactPage() {
  return (
    <div className="page-container pt-4 pb-0 sm:pt-6">
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <h1 className="display-heading text-5xl break-words sm:text-6xl">Request a demo</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{pageDescription}</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-5">
          <StrengthBell />
        </div>
      </div>
    </div>
  );
}
