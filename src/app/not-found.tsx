import { ButtonLink } from "@/components/ui/button";
import { mainNavigation } from "@/config/navigation";
import { routes } from "@/constants/routes";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center py-24 text-center">
      <p className="eyebrow text-muted">Error 404</p>
      <h1 className="display-heading mt-6 text-7xl sm:text-9xl">
        Page <span className="text-muted">missing.</span>
      </h1>
      <p className="mt-6 max-w-md text-muted">That address is not part of the platform. Try one of these instead.</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {mainNavigation.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex h-10 items-center rounded-full border border-stone px-4 text-sm hover:border-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink href={routes.home} wrapperClassName="mt-10" withArrow>
        Back to home
      </ButtonLink>
    </div>
  );
}
