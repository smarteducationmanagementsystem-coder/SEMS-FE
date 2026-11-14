"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import { routes } from "@/constants/routes";

let exitPath: string | null = null;
import { classNames } from "@/lib/format";
import { displayLogo, personaFor, portalSwitchRoles } from "../campus-data";
import { canAccessPath, isAdminNavActive, navForRole } from "../campus-nav";
import { hasStoredClientSession, useAdmin } from "../campus-state";
import { adminThemeStyle } from "../campus-theme";
import { InstitutionSignup } from "../signup/institution-signup";

const accents = ["#1d4ed8", "#0f766e", "#4c8dff", "#7c3aed", "#d97706", "#0ea5e9", "#db2777", "#16a34a", "#6366f1", "#ea580c", "#0891b2", "#be123c", "#2563eb", "#64748b", "#9333ea", "#0f766e"];
const SIDEBAR_KEY = "sems-sidebar-open";

function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { notice, clearNotice, theme, toggleTheme, role, setRole, settings, access, signOut, portalAccount, portalName, institutionCode } = useAdmin();
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;
  useEffect(() => {
    window.history.pushState({ semsPortal: true }, "", window.location.href);
    const leave = () => {
      exitPath = routes.home;
      signOutRef.current();
      window.location.replace(routes.home);
    };
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) leave();
    };
    window.addEventListener("popstate", leave);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("popstate", leave);
      window.removeEventListener("pageshow", onShow);
    };
  }, [pathname]);
  const [menuPath, setMenuPath] = useState(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    setSidebarOpen(window.localStorage.getItem(SIDEBAR_KEY) !== "0");
  }, []);
  function toggleSidebar() {
    setSidebarOpen((open) => {
      const next = !open;
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setProfileOpen(false);
  }

  const portalKey = portalAccount === "teacher" || portalAccount === "staff" || portalAccount === "student" ? portalAccount : undefined;
  const persona =
    portalAccount === "owner"
      ? personaFor(role, settings.ownerName)
      : {
          label: portalAccount === "student" ? "Student" : portalAccount === "staff" ? "Staff" : "Teacher",
          name: portalName || "Portal",
          title: portalAccount === "student" ? "Student" : portalAccount === "staff" ? "Staff" : "Teacher",
        };
  const links = navForRole(role, access, portalKey);
  const allowed = canAccessPath(pathname, role, access, portalKey);
  const logo = displayLogo(settings.logoUrl);

  const sidebar = (
    <div className="flex h-full flex-col border-r border-[var(--admin-line)] bg-[var(--admin-sidebar)] text-[var(--admin-nav-text)]">
      <nav aria-label="Campus" className="scrollbar-none flex-1 overflow-y-auto px-3 pt-4 pb-3">
        <ul className="space-y-1">
          {links.map((item, index) => {
            const active = isAdminNavActive(pathname, item.href);
            const Icon = item.icon;
            const accent = accents[index % accents.length];
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
                  style={active ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md" style={{ backgroundColor: `${accent}22`, color: accent }}>
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-[var(--admin-line)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => {
            const home = portalAccount === "teacher" || portalAccount === "staff" || portalAccount === "student";
            exitPath = home ? routes.home : routes.signup;
            signOut();
            router.push(home ? routes.home : routes.signup);
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#f07178] hover:bg-[#f07178]/10"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#f07178]/15">
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div id="admin-frame" data-theme={theme} style={adminThemeStyle(theme)} className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--admin-line)] bg-[var(--admin-header)] px-2 py-[max(0.5rem,env(safe-area-inset-top))] text-[var(--admin-header-text)] sm:gap-3 sm:px-5 md:min-h-16 md:py-2">
        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-[var(--admin-nav-active)] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>
        <button
          type="button"
          className="hidden size-10 shrink-0 place-items-center rounded-lg hover:bg-[var(--admin-nav-active)] md:grid"
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          <span className="sr-only">{sidebarOpen ? "Hide sidebar" : "Show sidebar"}</span>
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span
            className="size-9 shrink-0 rounded-full border border-[var(--admin-line)] bg-[var(--admin-surface)] bg-cover bg-center sm:size-12"
            style={logo ? { backgroundImage: `url("${logo}")` } : undefined}
            role="img"
            aria-label={logo ? `${settings.institutionName} logo` : "Institution logo"}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight sm:text-xl">{settings.institutionName}</p>
            {institutionCode ? <p className="truncate text-xs opacity-80">{institutionCode}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="relative">
          <button
            type="button"
            aria-expanded={portalAccount === "owner" ? profileOpen : undefined}
            onClick={() => {
              if (portalAccount !== "owner") return;
              setProfileOpen((open) => !open);
            }}
            className="flex h-10 items-center gap-2 rounded-lg bg-[var(--admin-nav-active)] px-2"
          >
            <span className="grid size-7 place-items-center rounded-full bg-[var(--admin-accent)] text-xs font-semibold text-white">{persona.name.slice(0, 1)}</span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-40 truncate text-xs font-semibold leading-tight">{persona.name}</span>
              <span className="block text-[10px] text-[var(--admin-muted)]">{persona.label}</span>
            </span>
            {portalAccount === "owner" ? <ChevronDown className="hidden size-4 text-[var(--admin-muted)] sm:block" /> : null}
          </button>
          {profileOpen && portalAccount === "owner" ? (
            <div className="absolute right-0 z-30 mt-2 w-[min(16rem,calc(100vw-1.5rem))] rounded-xl bg-[var(--admin-surface)] p-2 text-sm shadow-xl ring-1 ring-[var(--admin-line)]">
              <p className="px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">View as</p>
              {portalSwitchRoles.map((item) => {
                const option = personaFor(item, settings.ownerName);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRole(item);
                      setProfileOpen(false);
                    }}
                    className={classNames("block w-full rounded-lg px-2 py-2 text-left", item === role ? "bg-[var(--admin-nav-active)]" : "hover:bg-[var(--admin-nav-active)]")}
                  >
                    <span className="block font-medium">{option.label}</span>
                    {item === "super_admin" ? <span className="block text-xs text-[var(--admin-muted)]">{option.name}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--admin-nav-active)] hover:bg-[var(--admin-accent)]/20"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="size-5 text-[#f0b429]" /> : <Moon className="size-5 text-[var(--admin-accent)]" />}
        </button>
        </div>
      </header>
      <div className="relative flex min-h-0 min-w-0 flex-1">
        {menuOpen ? <button type="button" className="absolute inset-0 z-10 bg-black/50 md:hidden" aria-label="Close menu" onClick={() => setMenuOpen(false)} /> : null}
        <aside
          id="admin-sidebar"
          className={classNames(
            "shrink-0",
            menuOpen ? "absolute inset-y-0 left-0 z-20 w-72 max-w-[85vw] shadow-xl" : "max-md:hidden",
            sidebarOpen ? "md:static md:block md:w-72 md:shadow-none" : "md:hidden",
          )}
        >
          {sidebar}
        </aside>
        <div id="main-content" className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 lg:p-6">
          {notice ? (
            <p className="mb-4 flex items-start justify-between gap-3 rounded-xl bg-[var(--admin-surface)] px-4 py-3 text-sm text-[var(--admin-text)] ring-1 ring-[var(--admin-line)]" role="status">
              <span>{notice}</span>
              <button type="button" onClick={clearNotice} className="shrink-0 text-[var(--admin-muted)]" aria-label="Dismiss message">
                <X className="size-4" />
              </button>
            </p>
          ) : null}
          {allowed ? (
            children
          ) : (
            <div className="rounded-xl bg-[var(--admin-surface)] p-8 ring-1 ring-[var(--admin-line)]">
              <h1 className="text-xl font-semibold">This page is not open for this account.</h1>
              <p className="mt-2 max-w-lg text-sm text-[var(--admin-muted)]">The institution owner chooses these pages on the Permissions screen.</p>
              {links[0] ? (
                <Link href={links[0].href} className="mt-4 inline-flex text-sm font-semibold text-[var(--admin-accent)]">
                  Back to {links[0].label}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InstitutionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAdmin();
  const [checked, setChecked] = useState(false);
  const onLogin = pathname === routes.login;
  const onSignup = pathname === routes.signup;
  const onStudentLogin = pathname === routes.studentLogin;
  const onTeacherLogin = pathname === routes.teacherLogin;
  const publicAuth = onLogin || onSignup || onStudentLogin || onTeacherLogin;
  // The first render has no saved login yet. Wait until this browser read finishes before leaving the page.
  const signedIn = checked ? hasStoredClientSession() : Boolean(session);

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!signedIn && !publicAuth) {
      const next = exitPath ?? routes.signup;
      exitPath = null;
      router.replace(next);
    }
  }, [checked, signedIn, publicAuth, router]);

  if (publicAuth) return children;
  if (!checked) return null;
  if (!signedIn) return <InstitutionSignup />;
  return <AdminFrame>{children}</AdminFrame>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  return <InstitutionGate>{children}</InstitutionGate>;
}
