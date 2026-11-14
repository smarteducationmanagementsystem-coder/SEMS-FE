"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminField, adminFieldClass } from "@/components/institution/shared/fields";
import { useSiteTheme } from "@/components/layout/site-theme";
import { ApiError } from "@/lib/sems-api";
import { deletePlatformPayments, formatJoined, formatMonth, loadPlatformPayments, markPlatformPayment, type PlatformPaymentRow } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const PAGE_SIZE = 15;
const types = ["School", "College", "Academy"] as const;

function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function PlatformPayments() {
  const token = usePlatformAdminToken();
  const { theme } = useSiteTheme();
  const [typeChoice, setTypeChoice] = useState("");
  const [cityChoice, setCityChoice] = useState("");
  const [applied, setApplied] = useState({ type: "", city: "" });
  const [cities, setCities] = useState<string[]>([]);
  const [month, setMonth] = useState(thisMonth);
  const [rows, setRows] = useState<PlatformPaymentRow[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadPlatformPayments(token, applied.type, applied.city, month)
      .then((next) => {
        if (!active) return;
        setRows(next.rows);
        setCities(next.cities);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load payments.");
      });
    return () => {
      active = false;
    };
  }, [token, applied, month]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function applyFilter(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setNotice("");
    setApplied({ type: typeChoice, city: cityChoice });
  }

  async function changeStatus(id: string, status: "paid" | "unpaid") {
    if (!token) return;
    const previous = rows;
    setBusyId(id);
    setError("");
    setRows((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await markPlatformPayment(token, id, status, month);
      setNotice(status === "paid" ? `Marked as paid for ${formatMonth(month)}.` : `Marked as unpaid for ${formatMonth(month)}.`);
    } catch (reason) {
      setRows(previous);
      setError(reason instanceof ApiError ? reason.message : "Could not update the payment.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Billing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words">Payment marked</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">{month ? formatMonth(month) : "Current month"}. Choose paid or unpaid on each row.</p>
      </div>
      <form className="grid items-end gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)] sm:grid-cols-2 xl:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_minmax(0,12rem)_auto]" onSubmit={applyFilter}>
        <AdminField id="payment-month" label="Month">
          <input
            id="payment-month"
            type="month"
            required
            className={adminFieldClass}
            value={month}
            onChange={(event) => {
              if (!event.target.value) return;
              setPage(1);
              setMonth(event.target.value);
            }}
          />
        </AdminField>
        <AdminField id="payment-type" label="Institution type">
          <select id="payment-type" className={adminFieldClass} value={typeChoice} onChange={(event) => setTypeChoice(event.target.value)}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </AdminField>
        <AdminField id="payment-city" label="City">
          <select id="payment-city" className={adminFieldClass} value={cityChoice} onChange={(event) => setCityChoice(event.target.value)}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </AdminField>
        <AdminButton type="submit" className="w-full sm:col-span-2 xl:col-span-1 xl:w-auto">
          Apply filter
        </AdminButton>
      </form>
      {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
      <section className="min-w-0 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">
              <tr>
                <th className="px-2 py-2">Institution name</th>
                <th className="px-2 py-2">Institution type</th>
                <th className="px-2 py-2">City</th>
                <th className="px-2 py-2">Joining date</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => {
                const paid = item.status === "paid";
                const tone =
                  theme === "dark"
                    ? paid
                      ? { background: "#143d2a", color: "#b7ebc9" }
                      : { background: "#3d2418", color: "#ffd7a8" }
                    : paid
                      ? { background: "#e7f6ee", color: "#1f7a45" }
                      : { background: "#fff4e5", color: "#9a6410" };
                return (
                  <tr key={item.id} className="border-t border-[var(--admin-line)]">
                    <td className="px-2 py-3 font-medium">{item.name}</td>
                    <td className="px-2 py-3">{item.type}</td>
                    <td className="px-2 py-3">{item.city}</td>
                    <td className="px-2 py-3 whitespace-nowrap">{formatJoined(item.joinedAt)}</td>
                    <td className="px-2 py-3">
                      <label className="sr-only" htmlFor={`status-${item.id}`}>
                        Payment status for {item.name}
                      </label>
                      <select
                        id={`status-${item.id}`}
                        className={`${adminFieldClass} w-auto min-w-28 py-1.5 font-semibold`}
                        style={tone}
                        value={item.status}
                        disabled={busyId === item.id}
                        onChange={(event) => changeStatus(item.id, event.target.value === "paid" ? "paid" : "unpaid")}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-[var(--admin-muted)]">
                    No institutions match this filter.
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
      <form
        className="grid items-end gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)] sm:grid-cols-2 xl:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!fromMonth || !toMonth) {
            setError("Choose the start and end month.");
            return;
          }
          if (fromMonth > toMonth) {
            setError("The start month must be the same as or before the end month.");
            return;
          }
          setError("");
          setConfirmDelete(true);
        }}
      >
        <AdminField id="delete-from" label="Date from">
          <input id="delete-from" type="month" required className={adminFieldClass} value={fromMonth} onChange={(event) => setFromMonth(event.target.value)} />
        </AdminField>
        <AdminField id="delete-to" label="Date to">
          <input id="delete-to" type="month" required className={adminFieldClass} value={toMonth} onChange={(event) => setToMonth(event.target.value)} />
        </AdminField>
        <button type="submit" className="w-full rounded-xl bg-[#a3361f] px-4 py-2.5 text-sm font-semibold text-white sm:col-span-2 xl:col-span-1 xl:w-auto">
          Delete data
        </button>
        {confirmDelete ? (
          <div className="grid gap-3 sm:col-span-2 xl:col-span-3">
            <p className="text-sm text-[var(--admin-muted)]">
              This deletes saved payment status from {formatMonth(fromMonth)} through {formatMonth(toMonth)}. Institution records stay.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl bg-[#a3361f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={deleting}
                onClick={async () => {
                  if (!token) return;
                  setDeleting(true);
                  setError("");
                  try {
                    const result = await deletePlatformPayments(token, fromMonth, toMonth);
                    setNotice(`Deleted ${result.deleted} payment ${result.deleted === 1 ? "record" : "records"}.`);
                    setConfirmDelete(false);
                    setApplied((current) => ({ ...current }));
                  } catch (reason) {
                    setError(reason instanceof ApiError ? reason.message : "Could not delete the payment records.");
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                Delete these months
              </button>
              <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-[var(--admin-line)]" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
