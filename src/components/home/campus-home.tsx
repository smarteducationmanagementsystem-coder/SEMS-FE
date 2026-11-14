import Link from "next/link";
import Motivated from "@/components/animation/Motivated";
import ServicesUnlock from "@/components/animation/ServicesUnlock";
import Running from "@/components/animation/Running";
import { HeroSupplies } from "@/components/home/hero-supplies";
import { ButtonLink } from "@/components/ui/button";
import { StatsRipple } from "@/components/home/stats-ripple";
import { SectionHeading } from "@/components/ui/section-heading";
import { platformFaqs, platformFeatures, platformStats } from "@/config/platform";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

const homeServices = platformFeatures.filter(
  (feature) => feature.title !== "Attendance" && feature.title !== "Reports",
);

export function CampusHome() {
  return (
    <>
      <section className="page-container pt-10 pb-8 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="sr-only">{siteConfig.name}</h1>
            <HeroSupplies />
          </div>
          <div className="lg:col-span-5 lg:pb-3">
            <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.name} is the operating system for schools, colleges, and academies. Students, teachers, fees, attendance, examinations, and monthly reports live in one place.
            </p>
            <div className="mt-8 flex max-w-md flex-col gap-3">
              <Link
                href={routes.signup}
                className="flex h-14 items-center justify-center rounded-2xl bg-brand text-sm font-bold tracking-[0.16em] text-white uppercase shadow-[0_5px_0_0_#001038] transition-transform hover:translate-y-0.5 hover:shadow-[0_2px_0_0_#001038]"
              >
                Get started
              </Link>
              <Link
                href={routes.contact}
                className="flex h-14 items-center justify-center rounded-2xl border border-stone bg-paper text-sm font-bold tracking-[0.14em] text-brand uppercase transition-colors hover:bg-ivory-deep"
              >
                Request a demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="page-container py-20 sm:py-28">
        <div className="grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] lg:gap-x-12 lg:gap-y-10">
          <SectionHeading
            className="order-1 min-w-0 lg:col-start-1 lg:row-start-1"
            eyebrow="Service"
            title={
              <>
                <span className="block">Complete control over your</span>
                <span className="block">academic workflow.</span>
              </>
            }
            titleClassName="text-[1.65rem] leading-[1.05] sm:text-[2.15rem] lg:text-[2.65rem]"
            description="Empower your staff to manage student records, fee challans, and academic results from a single dashboard that eliminates manual paperwork."
          />
          <ul className="order-2 grid min-w-0 gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
            {homeServices.map((feature, index) => (
              <li key={feature.title} className="reveal rounded-[1.75rem] bg-paper p-6 ring-1 ring-stone">
                <p className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 font-display text-3xl break-words">
                  <Link href={feature.href} className="hover:underline hover:underline-offset-4">{feature.title}</Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{feature.body}</p>
              </li>
            ))}
          </ul>
          <div className="order-3 flex min-w-0 flex-col items-center gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="isolate w-full max-w-[420px] overflow-hidden">
              <ServicesUnlock className="mx-auto w-full" style={{ maxWidth: "100%" }} />
            </div>
            <ButtonLink href={routes.service} variant="outline">
              All services
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="page-container pb-8">
        <StatsRipple>
          {platformStats.map((stat) => (
            <div key={stat.label}>
              <p className="display-heading text-5xl sm:text-6xl">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </StatsRipple>
      </section>

      <section className="page-container pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="FAQ" title="Before you book a walkthrough." titleClassName="text-4xl sm:text-5xl lg:text-6xl" />
            <div className="mt-8 border-t border-stone">
              {platformFaqs.map((item) => (
                <details key={item.question} className="group border-b border-stone">
                  <summary className="cursor-pointer list-none py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">{item.question}</summary>
                  <p className="pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
                </details>
              ))}
            </div>
            <Link href={routes.faq} className="mt-6 inline-flex text-sm underline-offset-4 hover:underline">
              Read the full FAQ
            </Link>
          </div>
          <div className="min-w-0 overflow-hidden">
            <Running />
          </div>
        </div>
      </section>

      <section id="stay-motivated" className="page-container isolate pb-16 sm:pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="isolate z-0 min-w-0 overflow-hidden lg:order-1">
            <Motivated className="mx-auto w-full" style={{ maxWidth: "100%" }} />
          </div>
          <div className="order-first min-w-0 lg:order-2">
            <h2 className="display-heading text-5xl break-words sm:text-6xl">Stay motivated</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              Students, fees, and attendance stay in one place, so the office moves with the campus instead of behind it. Each finished register is a step the whole school can see.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
