"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminField, AdminModal, adminFieldClass } from "@/components/institution/shared/fields";
import { ApiError } from "@/lib/sems-api";
import { deletePlatformInstitution, formatJoined, loadPlatformInstitutions, loadPlatformStorage, savePlatformInstitution, type PlatformInstitution } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const PAGE_SIZE = 15;
const types = ["School", "College", "Academy"] as const;

export function PlatformInstitutions() {
  const token = usePlatformAdminToken();
  const [typeChoice, setTypeChoice] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [rows, setRows] = useState<PlatformInstitution[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<PlatformInstitution | null>(null);
  const [usage, setUsage] = useState("");
  const [usageBusy, setUsageBusy] = useState(false);
  const [edit, setEdit] = useState<PlatformInstitution | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadPlatformInstitutions(token, appliedType)
      .then((next) => {
        if (!active) return;
        setRows(next);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load institutions.");
      });
    return () => {
      active = false;
    };
  }, [token, appliedType]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pendingDelete = rows.find((item) => item.id === confirmId) ?? null;

  function openDetail(item: PlatformInstitution) {
    setDetail(item);
    setUsage("");
    setUsageBusy(true);
    if (!token) {
      setUsageBusy(false);
      setUsage("Could not measure storage.");
      return;
    }
    loadPlatformStorage(token, item.id)
      .then((next) => setUsage(next.label))
      .catch((reason: unknown) => setUsage(reason instanceof ApiError ? reason.message : "Could not measure storage."))
      .finally(() => setUsageBusy(false));
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!token || !edit) return;
    setBusy(true);
    setError("");
    try {
      const saved = await savePlatformInstitution(token, edit.id, edit);
      setRows((current) => current.map((item) => (item.id === saved.id ? saved : item)).filter((item) => !appliedType || item.type === appliedType));
      setDetail((current) => (current?.id === saved.id ? saved : current));
      setEdit(null);
      setNotice("Institution updated.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not update the institution.");
    } finally {
      setBusy(false);
    }
  }

  async function removeInstitution() {
    if (!token || !confirmId) return;
    setBusy(true);
    setError("");
    try {
      await deletePlatformInstitution(token, confirmId);
      setRows((current) => current.filter((item) => item.id !== confirmId));
      setDetail((current) => (current?.id === confirmId ? null : current));
      setConfirmId(null);
      setNotice("Institution and its records were deleted.");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not delete the institution.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Directory</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Registered institutions</h1>
      </div>
      <form
        className="grid items-end gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)] sm:grid-cols-[minmax(0,16rem)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setAppliedType(typeChoice);
        }}
      >
        <AdminField id="institution-type" label="Institution type">
          <select id="institution-type" className={adminFieldClass} value={typeChoice} onChange={(event) => setTypeChoice(event.target.value)}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </AdminField>
        <AdminButton type="submit">Apply filter</AdminButton>
      </form>
      {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
      <section className="min-w-0 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">
              <tr>
                <th className="px-2 py-2">Institution name</th>
                <th className="px-2 py-2">City</th>
                <th className="px-2 py-2">Phone no</th>
                <th className="px-2 py-2">Joining date</th>
                <th className="px-2 py-2">View detail</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-t border-[var(--admin-line)]">
                  <td className="px-2 py-3 font-medium">{item.name}</td>
                  <td className="px-2 py-3">{item.city}</td>
                  <td className="px-2 py-3">{item.phone || "—"}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{formatJoined(item.joinedAt)}</td>
                  <td className="px-2 py-3">
                    <button type="button" className="font-semibold text-[var(--admin-accent)]" onClick={() => openDetail(item)}>
                      View detail
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="font-semibold text-[var(--admin-accent)]" onClick={() => setEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="font-semibold text-[#a3361f]" onClick={() => setConfirmId(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-[var(--admin-muted)]">
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

      <AdminModal open={Boolean(detail)} title="Institution detail" onClose={() => setDetail(null)}>
        {detail ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              ["Institution name", detail.name],
              ["Email address", detail.email],
              ["Phone no", detail.phone || "—"],
              ["City", detail.city],
              ["Institution type", detail.type],
              ["Joining date", formatJoined(detail.joinedAt)],
              ["Total students", String(detail.students)],
              ["Teachers", String(detail.teachers)],
              ["Staff", String(detail.staff)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[var(--admin-surface-2)] px-3 py-2">
                <dt className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">{label}</dt>
                <dd className="mt-1 font-medium break-words">{value}</dd>
              </div>
            ))}
            <div className="rounded-xl bg-[var(--admin-surface-2)] px-3 py-2 sm:col-span-2">
              <dt className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">Data usage</dt>
              <dd className="mt-1 font-medium break-words">{usageBusy ? "Measuring storage…" : usage || "—"}</dd>
            </div>
          </dl>
        ) : null}
      </AdminModal>

      <AdminModal open={Boolean(edit)} title="Edit institution" onClose={() => setEdit(null)}>
        {edit ? (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveEdit}>
            <AdminField id="edit-name" label="Institution name">
              <input id="edit-name" required className={adminFieldClass} value={edit.name} onChange={(event) => setEdit({ ...edit, name: event.target.value })} />
            </AdminField>
            <AdminField id="edit-email" label="Email address">
              <input id="edit-email" type="email" required className={adminFieldClass} value={edit.email} onChange={(event) => setEdit({ ...edit, email: event.target.value })} />
            </AdminField>
            <AdminField id="edit-phone" label="Phone no">
              <input id="edit-phone" className={adminFieldClass} value={edit.phone} onChange={(event) => setEdit({ ...edit, phone: event.target.value })} />
            </AdminField>
            <AdminField id="edit-city" label="City">
              <input id="edit-city" required className={adminFieldClass} value={edit.city} onChange={(event) => setEdit({ ...edit, city: event.target.value })} />
            </AdminField>
            <AdminField id="edit-type" label="Institution type">
              <select id="edit-type" className={adminFieldClass} value={edit.type} onChange={(event) => setEdit({ ...edit, type: event.target.value as PlatformInstitution["type"] })}>
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </AdminField>
            <div className="sm:col-span-2">
              <AdminButton type="submit" disabled={busy}>
                Save institution
              </AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>

      <AdminModal open={Boolean(pendingDelete)} title="Delete institution" onClose={() => setConfirmId(null)}>
        <p className="text-sm text-[var(--admin-muted)]">
          This deletes {pendingDelete?.name || "this institution"} and every related record: students, teachers, staff, attendance, fees, results, and settings.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="rounded-xl bg-[#a3361f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60" disabled={busy} onClick={removeInstitution}>
            Delete institution
          </button>
          <button type="button" className="rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-[var(--admin-line)]" onClick={() => setConfirmId(null)}>
            Cancel
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
