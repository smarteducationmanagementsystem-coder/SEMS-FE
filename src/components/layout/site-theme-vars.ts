export const siteThemeKey = "sems-public-theme";

export type SiteTheme = "light" | "dark";

/** Public palette. Utilities read these variables, so swapping them restyles the home site. */
export const siteThemeVars: Record<SiteTheme, Record<string, string>> = {
  light: {
    "--color-ivory": "#f6f2e9",
    "--color-ivory-deep": "#ede7da",
    "--color-ink": "#171717",
    "--color-ink-soft": "#2a2927",
    "--color-paper": "#ffffff",
    "--color-stone": "#d8d4cc",
    "--color-muted": "#5c5850",
    "--color-lime": "#c8e65a",
    "--color-lime-deep": "#b4d23f",
    "--color-brand": "#0060e4",
    "--color-brand-deep": "#001038",
  },
  dark: {
    "--color-ivory": "#10151f",
    "--color-ivory-deep": "#181f2e",
    "--color-ink": "#f4f1ea",
    "--color-ink-soft": "#e4e0d6",
    "--color-paper": "#1b2436",
    "--color-stone": "#314056",
    "--color-muted": "#a8b3c7",
    "--color-lime": "#c8e65a",
    "--color-lime-deep": "#d4ee7a",
    "--color-brand": "#3b82f6",
    "--color-brand-deep": "#dbe7ff",
  },
};

const appPaths = ["/dashboard/", "/platformadmin/"];

/** Dashboards keep the saved theme. The public site and every sign-in or signup screen stay light. */
export function isAppPath(pathname: string) {
  return pathname === "/dashboard" || appPaths.some((path) => pathname.startsWith(path));
}

/** Runs before paint so a saved dark theme does not flash cream on a dashboard. */
export function siteThemeBootScript() {
  const dark = JSON.stringify(siteThemeVars.dark);
  const paths = JSON.stringify(appPaths);
  return `try{var p=location.pathname;var a=${paths};var app=p==="/dashboard";for(var i=0;i<a.length;i++){if(p.indexOf(a[i])===0)app=true;}if(app&&localStorage.getItem(${JSON.stringify(siteThemeKey)})==="dark"){var r=document.documentElement;var v=${dark};for(var k in v)r.style.setProperty(k,v[k]);r.style.colorScheme="dark";}}catch(e){}`;
}
