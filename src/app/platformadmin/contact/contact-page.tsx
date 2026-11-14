"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/sems-api";
import { formatJoined, loadContactMessages, type PlatformContactMessage } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const PAGE_SIZE = 15;

export function PlatformContact() {
  const token = usePlatformAdminToken();
  const [rows, setRows] = useState<PlatformContactMessage[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadContactMessages(token)
      .then((next) => {
        if (!active) return;
        setRows(next);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load messages.");
      });
    return () => {
      active = false;
    };
  }, [token]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Inbox</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words">Contact us</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">Messages sent from the public Contact page.</p>
      </div>
      {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
      <section className="min-w-0 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">
              <tr>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Institution</th>
                <th className="px-2 py-2">Message</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-[var(--admin-line)] align-top">
                  <td className="px-2 py-3 font-medium">{item.name}</td>
                  <td className="px-2 py-3 break-all">{item.email}</td>
                  <td className="px-2 py-3">{item.institution || "—"}</td>
                  <td className="max-w-sm px-2 py-3 break-words whitespace-pre-wrap">{item.message}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{formatJoined(item.createdAt)}</td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-[var(--admin-muted)]">
                    No messages yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--admin-muted)]">
          <p>
            {rows.length} records · page {safePage} of {pages}
          </p>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg px-3 py-1.5 ring-1 ring-[var(--admin-line)] disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              Previous
            </button>
            <button type="button" className="rounded-lg px-3 py-1.5 ring-1 ring-[var(--admin-line)] disabled:opacity-40" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
