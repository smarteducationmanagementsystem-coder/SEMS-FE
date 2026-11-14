"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { mainNavigation } from "@/config/navigation";
import { routes } from "@/constants/routes";
import { classNames } from "@/lib/format";

function isLinkActive(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface IndicatorPosition {
  left: number;
  width: number;
}

/**
 * Desktop pill navigation with a single dark indicator that glides between
 * links as the cursor moves (the Ahmed Javed reference). At rest the
 * indicator sits on the current page's link; with no active link it fades out.
 * Keyboard focus moves it too, so the effect isn't mouse-only.
 */
export function HeaderNavigation({ pathname }: { pathname: string }) {
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null);
  // The first placement snaps into position; later moves animate.
  const [hasPlacedIndicator, setHasPlacedIndicator] = useState(false);

  const activeIndex = mainNavigation.findIndex((link) => isLinkActive(pathname, link.href));
  const highlightedIndex = hoveredIndex ?? (activeIndex >= 0 ? activeIndex : null);

  // Measure after layout so the indicator matches the link's rendered size.
  useLayoutEffect(() => {
    const link = highlightedIndex === null ? null : linkRefs.current[highlightedIndex];
    if (!link) return;
    setIndicator({ left: link.offsetLeft, width: link.offsetWidth });
    const frame = requestAnimationFrame(() => setHasPlacedIndicator(true));
    return () => cancelAnimationFrame(frame);
  }, [highlightedIndex]);

  return (
    <nav aria-label="Main" className="mx-auto hidden lg:block">
      <ul
        className="relative flex items-center rounded-full border border-stone/80 bg-paper/50 p-1"
        onPointerLeave={() => setHoveredIndex(null)}
      >
        <span
          aria-hidden="true"
          className={classNames(
            "absolute top-1 bottom-1 left-0 rounded-full bg-ink",
            hasPlacedIndicator && "transition-[transform,width,opacity] duration-500 ease-[var(--ease-editorial)]",
            highlightedIndex === null || !indicator ? "opacity-0" : "opacity-100",
          )}
          style={indicator ? { width: indicator.width, transform: `translateX(${indicator.left}px)` } : undefined}
        />
        {mainNavigation.map((link, index) => (
          <li key={link.href}>
            <Link
              ref={(element) => {
                linkRefs.current[index] = element;
              }}
              href={link.href}
              aria-current={index === activeIndex ? "page" : undefined}
              onPointerEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              className={classNames(
                "relative flex h-10 items-center rounded-full px-4 text-base font-medium transition-colors duration-300",
                index === highlightedIndex ? "text-ivory" : "text-ink/75",
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
