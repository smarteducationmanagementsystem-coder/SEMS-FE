import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { classNames } from "@/lib/format";

export const adminFieldClass =
  "w-full rounded-xl border border-[var(--admin-line)] bg-[var(--admin-input)] px-3 py-2.5 text-sm text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]";

export const adminButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const pillTone = {
  good: "bg-[#e7f6ee] text-[#1f7a45]",
  warn: "bg-[#fff4e5] text-[#9a6410]",
  bad: "bg-[#fdecea] text-[#a3361f]",
  info: "bg-[#e7eefc] text-[#1d4ed8]",
  neutral: "bg-[var(--admin-surface-2)] text-[var(--admin-muted)]",
} as const;

export function AdminButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={classNames(adminButtonClass, className)} {...props} />;
}

export function AdminField({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-[#a3361f]">{error}</p> : null}
    </div>
  );
}

export function AdminPageIntro({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">{eyebrow}</p>
        <h1 className="mt-1 flex min-w-0 items-start gap-2 text-xl font-semibold tracking-tight break-words text-[var(--admin-text)] sm:text-2xl">
          {Icon ? <Icon className="mt-1 size-5 shrink-0 text-[var(--admin-accent)]" aria-hidden /> : null}
          <span className="min-w-0">{title}</span>
        </h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={classNames("rounded-xl bg-[var(--admin-surface)] p-4 text-[var(--admin-text)] shadow-sm ring-1 ring-[var(--admin-line)] sm:p-5", className)}>{children}</section>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof pillTone }) {
  return <span className={classNames("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide", pillTone[tone])}>{children}</span>;
}

export function detailText(value: string | number | null | undefined) {
  const text = String(value ?? "").trim();
  return text || "none";
}

export function openDatePicker(event: { preventDefault: () => void; currentTarget: HTMLInputElement }) {
  event.preventDefault();
  const input = event.currentTarget;
  if (typeof input.showPicker !== "function") return;
  try {
    input.showPicker();
  } catch {
    // The calendar is already open, or this browser blocked a second open.
  }
}

export function DetailFields({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3 rounded-xl bg-[var(--admin-surface-2)] px-3 py-2.5">
          <dt className="text-[11px] font-semibold tracking-[0.12em] text-[var(--admin-muted)] uppercase">{row.label}</dt>
          <dd className="text-right text-sm">{detailText(row.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminModal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#070e1c]/55" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--admin-surface)] p-5 text-[var(--admin-text)] shadow-2xl ring-1 ring-[var(--admin-line)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-[var(--admin-muted)]">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  fit?: boolean;
}

export function AdminTable<T extends { id: string }>({
  rows,
  columns,
  query,
  pageSize = 6,
  empty,
}: {
  rows: T[];
  columns: TableColumn<T>[];
  query: string;
  pageSize?: number;
  empty: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageQuery, setPageQuery] = useState(query);
  if (pageQuery !== query) {
    setPageQuery(query);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle)) : rows;
    if (!sortKey) return matched;
    const column = columns.find((item) => item.key === sortKey);
    return [...matched].sort((left, right) => {
      const a = column?.sortValue ? column.sortValue(left) : String((left as Record<string, unknown>)[sortKey] ?? "");
      const b = column?.sortValue ? column.sortValue(right) : String((right as Record<string, unknown>)[sortKey] ?? "");
      const compared = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
      return sortDir === "asc" ? compared : -compared;
    });
  }, [rows, query, sortKey, sortDir, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (filtered.length === 0) return <EmptyNote>{empty}</EmptyNote>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-line)] text-[11px] tracking-[0.12em] text-[var(--admin-muted)] uppercase">
              {columns.map((column) => (
                <th key={column.key} className={classNames("px-3 py-3 font-semibold", column.fit ? "w-px whitespace-nowrap" : "")}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1"
                    onClick={() => {
                      setSortDir(sortKey === column.key && sortDir === "asc" ? "desc" : "asc");
                      setSortKey(column.key);
                    }}
                  >
                    {column.label}
                    {sortKey === column.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-[var(--admin-line)] last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className={classNames("px-3 py-3 align-middle", column.fit ? "w-px whitespace-nowrap" : "")}>
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--admin-muted)]">
        <p>
          {filtered.length} records · page {safePage} of {pages}
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
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-[var(--admin-surface-2)] px-4 py-8 text-center text-sm text-[var(--admin-muted)]">{children}</p>;
}
