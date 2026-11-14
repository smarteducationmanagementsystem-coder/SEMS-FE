"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { SocialIconLink } from "@/components/ui/social-icon-link";
import { mainNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { socialLinks } from "@/config/social-links";
import { routes } from "@/constants/routes";
import { classNames } from "@/lib/format";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

/** Full-screen editorial menu for small screens: large numbered links, then quick category chips. */
export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Menu" placement="full" hideTitle>
      <nav aria-label="Mobile" className="flex min-h-full min-w-0 flex-col overflow-x-hidden px-4 pt-4 pb-8 sm:px-6">
        <ol className="border-t border-stone">
          {mainNavigation.map((link, index) => (
            <li
              key={link.href}
              className="translate-y-8 border-b border-stone opacity-0 transition-[translate,opacity] duration-700 ease-[var(--ease-editorial)] group-data-[state=open]/sheet:translate-y-0 group-data-[state=open]/sheet:opacity-100"
              // Stagger each link after the curtain opens.
              style={{ transitionDelay: `${180 + index * 70}ms` }}
            >
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={pathname === link.href ? "page" : undefined}
                className="group flex min-w-0 items-baseline gap-3 py-5 sm:gap-4"
              >
                <span className="eyebrow shrink-0 text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span
                  className={classNames(
                    "display-heading min-w-0 text-4xl break-words transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl",
                    pathname === link.href && "text-muted",
                  )}
                >
                  {link.label}
                </span>
                <ArrowUpRight className="ml-auto size-5 self-center opacity-40 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid min-w-0 grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-2">
          <Link href={routes.signup} onClick={onClose} className="min-w-0 rounded-2xl bg-ink px-4 py-3 text-center leading-snug break-words text-ivory min-[420px]:col-span-2">
            Institution signup
          </Link>
          <Link href={routes.studentLogin} onClick={onClose} className="min-w-0 rounded-2xl bg-paper px-4 py-3 text-center leading-snug break-words">
            Student portal
          </Link>
          <Link href={routes.teacherLogin} onClick={onClose} className="min-w-0 rounded-2xl bg-paper px-4 py-3 text-center leading-snug break-words">
            Teacher login
          </Link>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-10 text-sm text-muted">
          <p className="font-display text-xl font-semibold text-ink">{siteConfig.tagline}</p>
          <ul className="flex gap-2">
            {socialLinks.map((link) => (
              <li key={link.platform}>
                <SocialIconLink link={link} tone="dark" className="size-11" />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </ModalSheet>
  );
}
