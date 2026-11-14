"use client";

import { Shield } from "lucide-react";
import { personaFor } from "../campus-data";
import { navForRole } from "../campus-nav";
import { useAdmin } from "../campus-state";
import { AdminPageIntro, AdminPanel, Pill } from "../shared/fields";

const shownRoles = ["super_admin", "teacher", "student"] as const;

const descriptions: Record<(typeof shownRoles)[number], string> = {
  super_admin: "Institution owner. Opens every page of this campus and decides which pages teachers, staff, and students can use.",
  teacher: "Opens the pages assigned to teachers, marks attendance, and enters student marks.",
  student: "Sees the pages assigned to students, including personal attendance, fee slips, and published results.",
};

export function RolesPage() {
  const { role, setRole, settings, access } = useAdmin();
  const staffLinks = navForRole("teacher", access, "staff");
  return (
    <div className="grid gap-4">
      <AdminPageIntro icon={Shield} eyebrow="Access" title="Roles and permissions" description="Each role keeps the pages saved for this institution. Teacher, staff, and student pages are the permissions chosen by the owner." />
      <div className="grid gap-3 lg:grid-cols-2">
        {shownRoles.map((item) => {
          const persona = personaFor(item, settings.ownerName);
          const links = navForRole(item, access);
          return (
            <AdminPanel key={item}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{persona.label}</h2>
                  <p className="text-sm text-[var(--admin-muted)]">{persona.name} · {persona.title}</p>
                </div>
                {role === item ? <Pill tone="good">Current</Pill> : null}
              </div>
              <p className="mt-3 text-sm">{descriptions[item]}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {links.map((link) => (
                  <li key={link.href}><Pill>{link.label}</Pill></li>
                ))}
              </ul>
              <button type="button" onClick={() => setRole(item)} className="mt-4 text-sm font-semibold text-[var(--admin-accent)]">
                View dashboard as {persona.label}
              </button>
            </AdminPanel>
          );
        })}
        <AdminPanel>
          <div>
            <h2 className="text-lg font-semibold">Staff</h2>
            <p className="text-sm text-[var(--admin-muted)]">Campus staff</p>
          </div>
          <p className="mt-3 text-sm">Opens the pages the institution owner assigns to staff.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {staffLinks.map((link) => (
              <li key={link.href}><Pill>{link.label}</Pill></li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </div>
  );
}
