"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Institution } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass, Pill } from "../shared/fields";

export function InstitutionsPage() {
  const { institutions, saveInstitution, query } = useAdmin();
  const [draft, setDraft] = useState<Institution | null>(null);

  return (
    <div>
      <AdminPageIntro
        icon={Building2}
        eyebrow="Platform"
        title="Institutions"
        description="Each campus is its own account. Northline Academy is the workspace loaded in this demo."
        action={<AdminButton onClick={() => setDraft({ id: `ins-${Date.now()}`, name: "", city: "Lahore", type: "School", students: 0, plan: "Basic", status: "trial" })}>Register institution</AdminButton>}
      />
      <AdminPanel>
        <AdminTable
          rows={institutions}
          query={query}
          empty="No institutions match this search."
          columns={[
            { key: "name", label: "Institution", sortValue: (row) => row.name },
            { key: "city", label: "City" },
            { key: "type", label: "Type" },
            { key: "students", label: "Students", sortValue: (row) => row.students },
            { key: "plan", label: "Plan" },
            { key: "status", label: "Status", render: (row) => <Pill tone={row.status === "active" ? "good" : "warn"}>{row.status}</Pill> },
            { key: "actions", label: "", render: (row) => <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => setDraft(row)}>Edit</button> },
          ]}
        />
      </AdminPanel>
      <AdminModal open={Boolean(draft)} title="Institution" onClose={() => setDraft(null)}>
        {draft ? (
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); saveInstitution(draft); setDraft(null); }}>
            <AdminField id="iname" label="Name"><input id="iname" required className={adminFieldClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></AdminField>
            <AdminField id="icity" label="City"><input id="icity" className={adminFieldClass} value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></AdminField>
            <AdminField id="itype" label="Type">
              <select id="itype" className={adminFieldClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as Institution["type"] })}>
                <option>School</option><option>College</option><option>Academy</option>
              </select>
            </AdminField>
            <AdminField id="istudents" label="Students"><input id="istudents" type="number" className={adminFieldClass} value={draft.students} onChange={(event) => setDraft({ ...draft, students: Number(event.target.value) })} /></AdminField>
            <AdminField id="iplan" label="Plan">
              <select id="iplan" className={adminFieldClass} value={draft.plan} onChange={(event) => setDraft({ ...draft, plan: event.target.value as Institution["plan"] })}>
                <option>Basic</option><option>Professional</option><option>Enterprise</option>
              </select>
            </AdminField>
            <AdminButton type="submit">Save institution</AdminButton>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
