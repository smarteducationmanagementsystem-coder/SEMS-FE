"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { formatAdminDate, type Teacher } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass, DetailFields, openDatePicker, Pill } from "../shared/fields";

const blank = (): Teacher => ({
  id: `tch-${Date.now()}`,
  employeeNo: "",
  name: "",
  subject: "",
  classes: "",
  phone: "",
  email: "",
  qualification: "",
  joinedOn: "2026-11-06",
  status: "active",
});

function classChoice(room: { name: string; section: string }) {
  return room.section.trim() ? `${room.name} · ${room.section}` : room.name;
}

export function TeachersPage() {
  const { teachers, classes, saveTeacher, deleteTeacher, query } = useAdmin();
  const [draft, setDraft] = useState<Teacher | null>(null);
  const [detail, setDetail] = useState<Teacher | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div>
      <AdminPageIntro icon={Users} eyebrow="People" title="Teachers" description="Employment details and the classes each teacher is assigned to." action={<AdminButton onClick={() => setDraft(blank())}>Add teacher</AdminButton>} />
      <AdminPanel>
        <AdminTable
          rows={teachers}
          query={query}
          pageSize={15}
          empty="No teachers match this search."
          columns={[
            { key: "employeeNo", label: "ID" },
            { key: "name", label: "Name", sortValue: (row) => row.name },
            { key: "subject", label: "Subject" },
            { key: "classes", label: "Classes" },
            { key: "qualification", label: "Qualification" },
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
      <AdminModal open={Boolean(detail)} title={detail ? `${detail.name} details` : "Teacher details"} onClose={() => setDetail(null)}>
        {detail ? (
          <DetailFields
            rows={[
              { label: "ID", value: detail.employeeNo },
              { label: "Name", value: detail.name },
              { label: "Subject", value: detail.subject },
              { label: "Classes", value: detail.classes },
              { label: "Phone", value: detail.phone },
              { label: "Email", value: detail.email },
              { label: "Qualification", value: detail.qualification },
              { label: "Joining date", value: detail.joinedOn ? formatAdminDate(detail.joinedOn) : "" },
              { label: "Status", value: detail.status },
            ]}
          />
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(draft)} title="Teacher" onClose={() => setDraft(null)}>
        {draft ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const employeeNo = draft.employeeNo.trim() || `EMP-${String(teachers.length + 1).padStart(3, "0")}`;
              const message = await saveTeacher({ ...draft, employeeNo });
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
                ["subject", "Subject"],
              ] as const
            ).map(([key, label]) => (
              <AdminField key={key} id={key} label={label}>
                <input id={key} required className={adminFieldClass} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
              </AdminField>
            ))}
            <AdminField id="classes" label="Assigned classes">
              {classes.length === 0 ? (
                <select id="classes" required disabled className={adminFieldClass} value="">
                  <option value="">Add a class on the Academics page first</option>
                </select>
              ) : (
                <select id="classes" required className={adminFieldClass} value={draft.classes} onChange={(event) => setDraft({ ...draft, classes: event.target.value })}>
                  <option value="">Select a class</option>
                  {draft.classes && !classes.some((room) => classChoice(room) === draft.classes) ? <option value={draft.classes}>{draft.classes}</option> : null}
                  {classes.map((room) => (
                    <option key={room.id} value={classChoice(room)}>
                      {classChoice(room)}
                    </option>
                  ))}
                </select>
              )}
            </AdminField>
            {(
              [
                ["phone", "Phone"],
                ["email", "Email"],
                ["qualification", "Qualification"],
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
              <select id="status" className={adminFieldClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Teacher["status"] })}>
                <option value="active">active</option>
                <option value="on leave">on leave</option>
              </select>
            </AdminField>
            {formError ? <p className="sm:col-span-2 text-sm text-[#a3361f]">{formError}</p> : null}
            <div className="sm:col-span-2 flex justify-end">
              <AdminButton type="submit">Save teacher</AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(confirmId)} title="Remove teacher" onClose={() => setConfirmId(null)}>
        <p className="text-sm text-[var(--admin-muted)]">The employment record will leave the directory. Subject assignments already saved stay until you edit them.</p>
        <div className="mt-4 flex justify-end">
          <AdminButton
            className="bg-[#a3361f]"
            onClick={async () => {
              if (!confirmId) return;
              const message = await deleteTeacher(confirmId);
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
