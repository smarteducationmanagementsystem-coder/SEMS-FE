"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, House, Info, Layers, Mail, Tag, type LucideIcon } from "lucide-react";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { mainNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { routes } from "@/constants/routes";
import { classNames } from "@/lib/format";

/** Icons live in the phone and tablet menu only. The laptop header stays text. */
const menuIcons: Record<string, LucideIcon> = {
  [routes.home]: House,
  [routes.service]: Layers,
  [routes.pricing]: Tag,
  [routes.about]: Info,
  [routes.contact]: Mail,
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

/** Full-screen editorial menu for small screens: large numbered links, then quick category chips. */
export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Menu"
      placement="full"
      hideTitle
      headerContent={
        <Link href={routes.home} onClick={onClose} aria-label={`${siteConfig.name} home`} className="inline-flex min-w-0 shrink">
          <Image
            src="/brand/smart-education-logo.png"
            alt=""
            width={1024}
            height={262}
            className="h-11 w-auto max-w-[calc(100vw-6rem)] object-contain object-left sm:h-14 sm:max-w-[280px]"
          />
        </Link>
      }
    >
      <nav aria-label="Mobile" className="flex min-h-full min-w-0 flex-col overflow-x-hidden px-4 pt-4 pb-8 sm:px-6">
        <ol className="border-t border-stone">
          {mainNavigation.map((link, index) => {
            const Icon = menuIcons[link.href];
            return (
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
                className="group flex min-w-0 items-center gap-3 py-4 sm:gap-4"
              >
                <span className="eyebrow shrink-0 text-muted">{String(index + 1).padStart(2, "0")}</span>
                {Icon ? (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper ring-1 ring-stone">
                    <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                ) : null}
                <span
                  className={classNames(
                    "display-heading min-w-0 text-2xl break-words transition-transform duration-500 group-hover:translate-x-2 sm:text-3xl",
                    pathname === link.href && "text-muted",
                  )}
                >
                  {link.label}
                </span>
                <ArrowUpRight className="ml-auto size-5 shrink-0 self-center opacity-40 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
            );
          })}
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
      </nav>
    </ModalSheet>
  );
}
