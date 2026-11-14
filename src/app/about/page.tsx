import type { Metadata } from "next";
import Image from "next/image";
import LampReveal from "@/components/animation/LampReveal";
import { StatsRipple } from "@/components/home/stats-ripple";
import { platformStats } from "@/config/platform";
import { buildPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";

const pageDescription = `${siteConfig.name} builds a smart education management system for schools, colleges, and academies that want students, fees, attendance, and results in one place.`;

export const metadata: Metadata = buildPageMetadata({
  title: `About ${siteConfig.name}`,
  description: pageDescription,
  path: routes.about,
});

const values = [
  { title: "The office first", body: "Screens follow the work a registrar, accountant, and class teacher already do, instead of asking them to learn a new process.", ring: "ring-[#9ec9ff]" },
  { title: "Roles with edges", body: "A parent never sees another family's fees. A teacher enters marks for assigned classes. An accountant stays inside the ledger.", ring: "ring-[#f0c27a]" },
  { title: "Numbers you can print", body: "Challans, result cards, and monthly reports are documents, not just charts. They print cleanly and export to a spreadsheet.", ring: "ring-[#9ec9ff]" },
  { title: "Live Status Dashboard", body: "Monitor student flow, fee collections, and academic progress with real-time updates. Access instant reports and key metrics with minimal latency for proactive decision-making.", ring: "ring-[#f0c27a]" },
];

export default function AboutPage() {
  return (
    <div className="page-container min-w-0 overflow-x-clip pt-6 pb-20 sm:pt-10">
      <LampReveal>
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="mx-auto w-full max-w-md text-center lg:mx-0">
          <div className="relative mx-auto size-52 sm:size-60">
            <div className="absolute -inset-3 rounded-full bg-[#d7ecff] blur-md" aria-hidden="true" />
            <div className="relative size-full overflow-hidden rounded-full ring-[6px] ring-[#d3e8fb] ring-offset-4 ring-offset-ivory">
              <Image
                src="/zarii.jpeg"
                alt="Zarkhman Rasheed"
                fill
                sizes="240px"
                className="object-cover object-[center_18%]"
                priority
              />
            </div>
          </div>
          <h2 className="mt-6 font-display text-4xl break-words">Zarkhman Rasheed</h2>
          <p className="mt-2 text-base text-muted">Lead Developer & Creator of SEMS</p>
          <p className="mx-auto mt-4 inline-flex items-center rounded-full bg-[#e7f3ff] px-3 py-1 text-sm font-medium text-[#2457e6]">
            FAST-NU, Qualified
          </p>
          <blockquote className="mt-6 text-left text-base leading-relaxed text-ink/80">
            “As a qualified graduate from the National University of Computer and Emerging Sciences (FAST-NU), I built the Smart Education Management System (SEMS) to bridge the gap between traditional campus administration and modern digital efficiency. SEMS is engineered to eliminate manual paperwork by centralizing student records, fee collections, academic results, and staff workflows into a single, intuitive dashboard.”
          </blockquote>
        </div>
        <div className="min-w-0 rounded-[1.75rem] bg-ivory-deep p-5 sm:p-8">
          <p className="eyebrow flex items-center gap-3 text-muted">
            <span aria-hidden="true" className="inline-block h-px w-8 bg-current" />
            The project
          </p>
          <h1 className="display-heading mt-4 text-4xl break-words sm:text-5xl">{siteConfig.tagline}</h1>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
            <p>{siteConfig.description}</p>
            <p>
              {siteConfig.name} started from a simple observation: most campuses already know their process. What they lack is one register that the principal, the accounts desk, the class teacher, and the parent can trust.
            </p>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {values.map((item, index) => (
              <li key={item.title} className={`rounded-2xl bg-paper p-4 ring-1 ${item.ring}`}>
                <p className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 font-display text-2xl break-words">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <StatsRipple className="mt-10 bg-paper ring-1 ring-stone" contentClassName="grid gap-6 px-6 py-8 sm:grid-cols-4 sm:px-10">
        {platformStats.map((stat) => (
          <div key={stat.label}>
            <p className="display-heading text-4xl">{stat.value}</p>
            <p className="mt-2 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </StatsRipple>
      </LampReveal>
    </div>
  );
}
