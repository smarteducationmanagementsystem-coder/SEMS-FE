import type { Metadata } from "next";
import Link from "next/link";
import Counterspace from "@/components/animation/Counterspace";
import InkDrops from "@/components/animation/InkDrops";
import { abilities } from "@/config/platform";
import { buildPageMetadata } from "@/config/seo";
import { routes } from "@/constants/routes";

const pageDescription = "Students, teachers, staff, attendance, fees, exams, results, and reports. Each one opens its own page.";

export const metadata: Metadata = buildPageMetadata({
  title: "Service",
  description: "Every service in Smart Education Management System: students, teachers, staff, attendance, fees, exams, results, and reports.",
  path: routes.service,
});

export default function ServicePage() {
  return (
    <div className="page-container pt-6 pb-20 sm:pt-10">
      <InkDrops inkColor="#b7e6ff" />
      <Counterspace text="All services." fit={false} className="display-heading max-w-full text-5xl break-words sm:text-6xl" />
      <p className="mt-5 max-w-xl text-muted">{pageDescription}</p>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Click or hold any blank white or grey space and ink drops in. Click a letter in the heading to fill the hole inside it. Refresh brings the empty page back.
      </p>
      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {abilities.map((ability) => (
          <li key={ability.title} className="rounded-[1.75rem] bg-paper p-6 ring-1 ring-stone">
            <h2 className="font-display text-3xl">
              <Link href={ability.href} className="hover:underline hover:underline-offset-4">
                {ability.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{ability.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
