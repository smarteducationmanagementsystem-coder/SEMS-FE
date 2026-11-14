"use client";

import { useEffect, useState } from "react";
import { useSiteTheme } from "@/components/layout/site-theme";
import { formatMoney } from "@/components/institution/campus-data";
import { ApiError } from "@/lib/sems-api";
import { loadPlatformStats, type PlatformStats } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const tones = {
  blue: { light: { bg: "#dbeafe", text: "#1e3a8a", note: "#1d4ed8" }, dark: { bg: "#1e3a8a", text: "#eff6ff", note: "#bfdbfe" } },
  purple: { light: { bg: "#ede9fe", text: "#4c1d95", note: "#6d28d9" }, dark: { bg: "#4c1d95", text: "#f5f3ff", note: "#ddd6fe" } },
  pink: { light: { bg: "#fce7f3", text: "#831843", note: "#be185d" }, dark: { bg: "#831843", text: "#fdf2f8", note: "#fbcfe8" } },
  orange: { light: { bg: "#ffedd5", text: "#7c2d12", note: "#c2410c" }, dark: { bg: "#9a3412", text: "#fff7ed", note: "#fed7aa" } },
  green: { light: { bg: "#dcfce7", text: "#14532d", note: "#15803d" }, dark: { bg: "#14532d", text: "#f0fdf4", note: "#bbf7d0" } },
  teal: { light: { bg: "#ccfbf1", text: "#134e4a", note: "#0f766e" }, dark: { bg: "#115e59", text: "#f0fdfa", note: "#99f6e4" } },
} as const;

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthTitle(month: string) {
  const [year, index] = month.split("-");
  const name = monthNames[Number(index) - 1];
  return name && year ? `${name} ${year}` : month;
}

export function PlatformDashboard() {
  const token = usePlatformAdminToken();
  const { theme } = useSiteTheme();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [error, setError] = useState("");
  const mode = theme === "dark" ? "dark" : "light";

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadPlatformStats(token)
      .then((next) => {
        if (active) setStats(next);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load the dashboard.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  const month = stats ? monthTitle(stats.month) : "";
  const cards = stats
    ? [
        { label: "Total institutions", value: String(stats.institutions), note: "Registered", tone: tones.blue[mode] },
        { label: "Total students", value: String(stats.students), note: "All institutions", tone: tones.purple[mode] },
        { label: "Teachers and staff", value: String(stats.people), note: "All institutions", tone: tones.pink[mode] },
        { label: "Pending payment", value: String(stats.pendingPayment), note: `${month} · unpaid institutions`, tone: tones.orange[mode] },
        { label: "Paid payment", value: String(stats.paidPayment), note: `${month} · paid institutions`, tone: tones.green[mode] },
        { label: "Current month revenue", value: formatMoney(stats.revenue), note: `${month} · collected fees`, tone: tones.teal[mode] },
      ]
    : [];

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl px-4 py-4" style={{ backgroundColor: card.tone.bg, color: card.tone.text }}>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: card.tone.note }}>
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs" style={{ color: card.tone.note }}>
              {card.note}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
