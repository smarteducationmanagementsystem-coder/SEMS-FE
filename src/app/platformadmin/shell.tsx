"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Building2, Clock, CreditCard, LayoutDashboard, LogOut, Mail, Menu, MessageSquare, Moon, PanelLeftClose, PanelLeftOpen, Settings, Sun, Tags, X } from "lucide-react";
import { useSiteTheme } from "@/components/layout/site-theme";
import { adminThemeStyle } from "@/components/institution/campus-theme";
import { routes } from "@/constants/routes";
import { classNames } from "@/lib/format";
import { hasStoredPlatformAdminSession, signOutPlatformAdmin, usePlatformAdminSession } from "./session";

const links = [
  { href: routes.platformDashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.platformInstitutions, label: "Registered institutions", icon: Building2 },
  { href: routes.platformPayments, label: "Payment marked", icon: CreditCard },
  { href: routes.platformPending, label: "Pending payment", icon: Clock },
  { href: routes.platformEmail, label: "Sending email", icon: Mail },
  { href: routes.platformContact, label: "Contact us", icon: MessageSquare },
  { href: routes.platformPricing, label: "Pricing", icon: Tags },
  { href: routes.platformSettings, label: "Setting", icon: Settings },
];

export function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === routes.platformAdmin) return children;
  return <PlatformFrame pathname={pathname}>{children}</PlatformFrame>;
}

function PlatformFrame({ pathname, children }: { pathname: string; children: ReactNode }) {
  const router = useRouter();
  const hookSignedIn = usePlatformAdminSession();
  const { theme, toggleTheme } = useSiteTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setMenuOpen(false);
  }
  // The first render has no saved login yet. Wait until this browser read finishes before leaving the page.
  const signedIn = checked ? hasStoredPlatformAdminSession() : hookSignedIn;

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!signedIn) router.replace(routes.platformAdmin);
  }, [checked, signedIn, router]);

  if (!checked || !signedIn) return null;

  const sidebar = (
    <div className="flex h-full flex-col border-r border-[var(--admin-line)] bg-[var(--admin-sidebar)] text-[var(--admin-nav-text)]">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--admin-muted)]">Platform admin</p>
      </div>
      <nav aria-label="Platform" className="flex-1 overflow-y-auto px-3 pb-3">
        <ul className="space-y-1">
          {links.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={classNames(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-[var(--admin-nav-active)] text-[var(--admin-text)]" : "hover:bg-[var(--admin-nav-active)]",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-[var(--admin-line)] p-3">
        <button
          type="button"
          onClick={() => {
            signOutPlatformAdmin();
            router.replace(routes.platformAdmin);
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#f07178] hover:bg-[#f07178]/10"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div id="admin-frame" data-theme={theme} style={adminThemeStyle(theme)} className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--admin-line)] bg-[var(--admin-header)] px-2 py-[max(0.5rem,env(safe-area-inset-top))] sm:px-4">
        <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-[var(--admin-nav-active)] md:hidden" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>
        <button type="button" className="hidden size-10 shrink-0 place-items-center rounded-lg hover:bg-[var(--admin-nav-active)] md:grid" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}>
          {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          <span className="sr-only">{sidebarOpen ? "Hide sidebar" : "Show sidebar"}</span>
        </button>
        <p className="min-w-0 flex-1 truncate text-base font-semibold sm:text-lg">Platform admin</p>
        <button type="button" onClick={toggleTheme} aria-pressed={theme === "dark"} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--admin-nav-active)]" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun className="size-5 text-[#f0b429]" /> : <Moon className="size-5 text-[var(--admin-accent)]" />}
        </button>
      </header>
      <div className="relative flex min-h-0 min-w-0 flex-1">
        {menuOpen ? <button type="button" className="absolute inset-0 z-10 bg-black/50 md:hidden" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}
        <aside
          className={classNames(
            "shrink-0",
            menuOpen ? "absolute inset-y-0 left-0 z-20 w-72 max-w-[85vw] shadow-xl" : "max-md:hidden",
            sidebarOpen ? "md:static md:block md:w-72 md:shadow-none" : "md:hidden",
          )}
        >
          {sidebar}
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">{children}</div>
      </div>
    </div>
  );
}
