import type { CSSProperties } from "react";

export type AdminTheme = "light" | "dark";

const lightVars = {
  "--admin-bg": "#e7eef8",
  "--admin-surface": "#ffffff",
  "--admin-surface-2": "#f3f7fd",
  "--admin-header": "#ffffff",
  "--admin-sidebar": "#f4f7fc",
  "--admin-text": "#0e1b3d",
  "--admin-muted": "#5c6b8a",
  "--admin-line": "#d5deee",
  "--admin-input": "#f5f8fc",
  "--admin-accent": "#1d4ed8",
  "--admin-nav-text": "#24345c",
  "--admin-nav-active": "#e4ecf8",
  "--admin-header-text": "#0e1b3d",
} as const;

const darkVars = {
  "--admin-bg": "#070e1c",
  "--admin-surface": "#101a2e",
  "--admin-surface-2": "#16233c",
  "--admin-header": "#0c1528",
  "--admin-sidebar": "#0c1528",
  "--admin-text": "#eef3ff",
  "--admin-muted": "#9aabc9",
  "--admin-line": "#243352",
  "--admin-input": "#152238",
  "--admin-accent": "#60a5fa",
  "--admin-nav-text": "#d5e2f7",
  "--admin-nav-active": "#1a2946",
  "--admin-header-text": "#eef3ff",
} as const;

/** CSS variables set on the frame. The stylesheet drops these selectors, so they have to live inline. */
export function adminThemeStyle(theme: AdminTheme): CSSProperties {
  return {
    ...(theme === "dark" ? darkVars : lightVars),
    backgroundColor: "var(--admin-bg)",
    color: "var(--admin-text)",
    colorScheme: theme,
  } as CSSProperties;
}
