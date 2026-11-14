"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { routes } from "@/constants/routes";
import { HEADER_COMPACT_SCROLL_OFFSET } from "@/constants/ui";
import { classNames } from "@/lib/format";
import { HeaderNavigation } from "./header-navigation";
import { MobileMenu } from "./mobile-menu";
import { Wordmark } from "./wordmark";

const iconButtonClasses =
  "grid size-10 place-items-center rounded-full transition-colors duration-300 hover:bg-ink hover:text-ivory";

/**
 * Sticky header that starts as a full-width bar and condenses into a floating
 * blurred pill once the page scrolls. Desktop shows a pill navigation group;
 * mobile collapses navigation into a full-screen menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCompactState = () => setIsCompact(window.scrollY > HEADER_COMPACT_SCROLL_OFFSET);
    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });
    return () => window.removeEventListener("scroll", updateCompactState);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 overflow-x-clip px-2 pt-2 sm:px-3">
      {/*
        Always a frosted pill (Zellbury style), so it reads over the hero photos.
        Width and padding never change; scrolling only adds a soft shadow.
      */}
      <div
        className={classNames(
          "mx-auto flex min-h-[4.75rem] w-full min-w-0 max-w-[90rem] items-center gap-3 rounded-full border border-ivory/60 bg-ivory/80 px-3 py-2 backdrop-blur-xl sm:min-h-[5.5rem] sm:px-5 lg:min-h-[6.25rem]",
          "transition-[border-color,box-shadow] duration-500 ease-[var(--ease-editorial)]",
          isCompact ? "border-stone/70 shadow-[0_10px_40px_-20px_rgba(23,23,23,0.35)]" : "shadow-none",
        )}
      >
        <Wordmark />

        <HeaderNavigation pathname={pathname} />

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Link
            href={routes.studentLogin}
            className="ml-1 hidden h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold tracking-[0.04em] text-ink uppercase ring-1 ring-ink/20 transition-colors hover:bg-ink hover:text-ivory lg:flex"
          >
            Student portal
          </Link>
          <Link
            href={routes.teacherLogin}
            className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold tracking-[0.04em] text-ink uppercase ring-1 ring-ink/20 transition-colors hover:bg-ink hover:text-ivory lg:flex"
          >
            Teacher login
          </Link>
          <Link
            href={routes.signup}
            className="ml-1 hidden h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-[#6eacff] px-4 text-[13px] font-semibold tracking-[0.04em] text-ink uppercase transition-colors hover:bg-ink hover:text-ivory md:flex"
          >
            Institution signup
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={classNames(iconButtonClasses, "lg:hidden")}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} pathname={pathname} />
    </header>
  );
}
