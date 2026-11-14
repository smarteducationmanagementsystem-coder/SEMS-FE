import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { routes } from "@/constants/routes";

export function CampusModule({
  title,
  description,
  points,
  path,
  dashboardHref,
}: {
  title: string;
  description: string;
  points: string[];
  path: string;
  dashboardHref: string;
}) {
  return (
    <div className="page-container pt-6 pb-20 sm:pt-10">
      <Breadcrumbs items={[{ name: "Home", href: routes.home }, { name: title, href: path }]} />
      <p className="eyebrow mt-8 text-muted">Campus module</p>
      <h1 className="display-heading mt-4 max-w-4xl text-5xl break-words sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-xl text-muted">{description}</p>
      <ul className="mt-10 grid max-w-3xl gap-3">
        {points.map((point) => (
          <li key={point} className="rounded-2xl bg-paper px-5 py-4 text-sm ring-1 ring-stone">
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href={dashboardHref} withArrow>
          Open in dashboard
        </ButtonLink>
        <ButtonLink href={routes.contact} variant="outline">
          Request a demo
        </ButtonLink>
      </div>
    </div>
  );
}
