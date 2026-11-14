"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { formatAdminDate, type StaffMember } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass, DetailFields, openDatePicker, Pill } from "../shared/fields";

const blank = (): StaffMember => ({
  id: `stf-${Date.now()}`,
  employeeNo: "",
  name: "",
  role: "",
  department: "Administration",
  phone: "",
  email: "",
  joinedOn: "2026-11-06",
  status: "active",
});

export function StaffPage() {
  const { staff, saveStaff, deleteStaff, query } = useAdmin();
  const [draft, setDraft] = useState<StaffMember | null>(null);
  const [detail, setDetail] = useState<StaffMember | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div>
      <AdminPageIntro icon={Briefcase} eyebrow="People" title="Staff" description="Non-teaching employees, departments, and employment history." action={<AdminButton onClick={() => setDraft(blank())}>Add staff</AdminButton>} />
      <AdminPanel>
        <AdminTable
          rows={staff}
          query={query}
          pageSize={15}
          empty="No staff match this search."
          columns={[
            { key: "employeeNo", label: "ID" },
            { key: "name", label: "Name", sortValue: (row) => row.name },
            { key: "role", label: "Role" },
            { key: "department", label: "Department" },
            { key: "joinedOn", label: "Joined" },
            { key: "status", label: "Status", render: (row) => <Pill tone={row.status === "active" ? "good" : "warn"}>{row.status}</Pill> },
            {
              key: "detail",
              label: "Detail",
              fit: true,
              render: (row) => (
                <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => setDetail(row)}>
                  View detail
                </button>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              fit: true,
              render: (row) => (
                <span className="flex gap-3">
                  <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => setDraft(row)}>
                    Edit
                  </button>
                  <button type="button" className="text-xs font-semibold text-[#a3361f]" onClick={() => setConfirmId(row.id)}>
                    Delete
                  </button>
                </span>
              ),
            },
          ]}
        />
      </AdminPanel>
      <AdminModal open={Boolean(detail)} title={detail ? `${detail.name} details` : "Staff details"} onClose={() => setDetail(null)}>
        {detail ? (
          <DetailFields
            rows={[
              { label: "ID", value: detail.employeeNo },
              { label: "Name", value: detail.name },
              { label: "Role", value: detail.role },
              { label: "Department", value: detail.department },
              { label: "Phone", value: detail.phone },
              { label: "Email", value: detail.email },
              { label: "Joining date", value: detail.joinedOn ? formatAdminDate(detail.joinedOn) : "" },
              { label: "Status", value: detail.status },
            ]}
          />
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(draft)} title="Staff member" onClose={() => setDraft(null)}>
        {draft ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const employeeNo = draft.employeeNo.trim() || `STF-${String(staff.length + 1).padStart(3, "0")}`;
              const message = await saveStaff({ ...draft, employeeNo });
              if (message) {
                setFormError(message);
                return;
              }
              setFormError(null);
              setDraft(null);
            }}
          >
            {(
              [
                ["name", "Name"],
                ["department", "Department"],
                ["phone", "Phone"],
                ["email", "Email"],
              ] as const
            ).map(([key, label]) => (
              <AdminField key={key} id={key} label={label}>
                <input id={key} required className={adminFieldClass} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
              </AdminField>
            ))}
            <AdminField id="joinedOn" label="Joining date">
              <input
                id="joinedOn"
                type="date"
                required
                className={adminFieldClass}
                value={draft.joinedOn}
                onClick={openDatePicker}
                onChange={(event) => setDraft({ ...draft, joinedOn: event.target.value })}
              />
            </AdminField>
            <AdminField id="status" label="Status">
              <select id="status" className={adminFieldClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as StaffMember["status"] })}>
                <option value="active">active</option>
                <option value="on leave">on leave</option>
              </select>
            </AdminField>
            {formError ? <p className="sm:col-span-2 text-sm text-[#a3361f]">{formError}</p> : null}
            <div className="sm:col-span-2 flex justify-end">
              <AdminButton type="submit">Save staff</AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(confirmId)} title="Remove staff record" onClose={() => setConfirmId(null)}>
        <p className="text-sm text-[var(--admin-muted)]">This removes the employee from the directory.</p>
        <div className="mt-4 flex justify-end">
          <AdminButton
            className="bg-[#a3361f]"
            onClick={async () => {
              if (!confirmId) return;
              const message = await deleteStaff(confirmId);
              if (!message) setConfirmId(null);
            }}
          >
            Delete
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}
