"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { grantablePages } from "../campus-nav";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminPageIntro, AdminPanel } from "../shared/fields";

export function PermissionsPage() {
  const { role, access, saveAccess } = useAdmin();
  const pages = grantablePages();
  const [draft, setDraft] = useState(access);
  const [seen, setSeen] = useState(access);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (seen !== access) {
    setSeen(access);
    setDraft(access);
  }

  if (role !== "super_admin") {
    return (
      <AdminPanel>
        <h1 className="text-xl font-semibold">Permissions stay with the Super Admin.</h1>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">Switch back to Super Admin to choose which pages teachers, staff, and students can open.</p>
      </AdminPanel>
    );
  }

  function toggle(who: "teacher" | "staff" | "student", href: string, allowed: boolean) {
    setDraft((current) => {
      const list = current[who];
      const next = allowed ? (list.includes(href) ? list : [...list, href]) : list.filter((item) => item !== href);
      return { ...current, [who]: next };
    });
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={KeyRound}
        eyebrow="Access"
        title="Permissions"
        description="The institution Super Admin chooses which portal pages teachers, staff, and students can open. Each group is saved separately. The Super Admin keeps every page."
      />
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-line)] text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">
                <th className="py-3 pr-4 text-left font-semibold">Page</th>
                <th className="w-28 px-3 py-3 text-center font-semibold whitespace-nowrap">Teacher</th>
                <th className="w-28 px-3 py-3 text-center font-semibold whitespace-nowrap">Staff</th>
                <th className="w-28 px-3 py-3 text-center font-semibold whitespace-nowrap">Student</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.href} className="border-b border-[var(--admin-line)] last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{page.label}</td>
                  {(["teacher", "staff", "student"] as const).map((who) => {
                    const checked = draft[who].includes(page.href);
                    return (
                      <td key={who} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => toggle(who, page.href, event.target.checked)}
                          aria-label={`${who} can open ${page.label}`}
                          className="size-4 accent-[var(--admin-accent)]"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error ? <p className="mt-3 text-sm text-[#a3361f]">{error}</p> : null}
        <div className="mt-4 flex justify-end">
          <AdminButton
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError(null);
              const message = await saveAccess(draft);
              setPending(false);
              if (message) setError(message);
            }}
          >
            {pending ? "Saving..." : "Save"}
          </AdminButton>
        </div>
      </AdminPanel>
    </div>
  );
}
