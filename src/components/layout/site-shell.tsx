"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { routes } from "@/constants/routes";

interface SiteShellProps {
  children: ReactNode;
  announcement: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}

/** Public chrome stays off the campus dashboard and the signup/login screens. */
export function SiteShell({ children, announcement, header, footer }: SiteShellProps) {
  const pathname = usePathname();
  const isFullBleed =
    pathname === routes.admin ||
    pathname.startsWith(`${routes.admin}/`) ||
    pathname === routes.signup ||
    pathname === routes.login ||
    pathname === routes.studentLogin ||
    pathname === routes.teacherLogin ||
    pathname === routes.platformAdmin ||
    pathname.startsWith(`${routes.platformAdmin}/`);

  if (isFullBleed) {
    return <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden">{children}</div>;
  }

  return (
    <>
      {announcement}
      {header}
      <main id="main-content" className="min-w-0">
        {children}
      </main>
      {footer}
    </>
  );
}
