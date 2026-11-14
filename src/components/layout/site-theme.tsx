"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { isAppPath, siteThemeKey, siteThemeVars, type SiteTheme } from "./site-theme-vars";

interface SiteThemeContextValue {
  theme: SiteTheme;
  toggleTheme: () => void;
}

const listeners = new Set<() => void>();

function emitTheme() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readTheme(): SiteTheme {
  try {
    return localStorage.getItem(siteThemeKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applySiteTheme(theme: SiteTheme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(siteThemeVars[theme])) root.style.setProperty(key, value);
  root.style.colorScheme = theme;
}

function storeTheme(theme: SiteTheme) {
  try {
    localStorage.setItem(siteThemeKey, theme);
  } catch {
    // Private browsing can block storage; the colors still update for this visit.
  }
  applySiteTheme(theme);
  emitTheme();
}

const SiteThemeContext = createContext<SiteThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

function serverTheme(): SiteTheme {
  return "light";
}

export function SiteThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const savedTheme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const theme = isAppPath(pathname) ? savedTheme : "light";

  useEffect(() => {
    applySiteTheme(theme);
  }, [theme]);

  return (
    <SiteThemeContext.Provider value={{ theme, toggleTheme: () => storeTheme(savedTheme === "dark" ? "light" : "dark") }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}
