import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/constants/routes";

interface ContentPageProps {
  title: string;
  path: string;
  intro?: ReactNode;
  eyebrow?: string;
  trail?: boolean;
  children: ReactNode;
}

/** Shared shell for information pages: optional breadcrumb, serif title, intro and a readable content column. */
export function ContentPage({ title, path, intro, eyebrow, trail = true, children }: ContentPageProps) {
  return (
    <div className="page-container pt-6 sm:pt-10">
      {trail ? (
        <Breadcrumbs
          items={[
            { name: "Home", href: routes.home },
            { name: title, href: path },
          ]}
        />
      ) : null}
      <header className={trail ? "mt-6 max-w-3xl" : "max-w-3xl"}>
        {eyebrow ? <p className="eyebrow text-muted">{eyebrow}</p> : null}
        <h1 className="display-heading mt-2 text-5xl break-words sm:text-6xl">{title}</h1>
        {intro ? <div className="mt-6 text-lg leading-relaxed text-muted">{intro}</div> : null}
      </header>
      <div className="mt-12">{children}</div>
    </div>
  );
}
