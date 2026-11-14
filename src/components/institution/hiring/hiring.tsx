"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { HiringCandidate } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass, DetailFields } from "../shared/fields";

const blank = (): HiringCandidate => ({
  id: `hire-${Date.now()}`,
  name: "",
  phone: "",
  email: "",
  gender: "Male",
  address: "",
  qualification: "",
  subject: "",
});

export function HiringPage() {
  const { hiring, saveHiring, deleteHiring, query } = useAdmin();
  const [draft, setDraft] = useState<HiringCandidate | null>(null);
  const [detail, setDetail] = useState<HiringCandidate | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const subjects = [...new Set(hiring.map((item) => item.subject.trim()).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const rows = subject ? hiring.filter((item) => item.subject.trim().toLowerCase() === subject.toLowerCase()) : hiring;

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={UserPlus}
        eyebrow="People"
        title="Hiring staff"
        description="Keep teachers who are waiting for a class. Filter the list by the subject entered at hiring."
        action={
          <AdminButton
            onClick={() => {
              setFormError(null);
              setDraft(blank());
            }}
          >
            Add hiring
          </AdminButton>
        }
      />
      <AdminPanel>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-[var(--admin-muted)]">
            <span className="mb-1.5 block">Subject</span>
            <select className={`${adminFieldClass} h-11 w-44`} value={subject} onChange={(event) => setSubject(event.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {subject ? (
            <button type="button" className="h-11 rounded-xl px-4 text-sm" onClick={() => setSubject("")}>
              Clear filter
            </button>
          ) : null}
        </div>
        <AdminTable
          rows={rows}
          query={query}
          pageSize={15}
          empty={subject ? `No hiring records for ${subject}.` : "No hiring records yet."}
          columns={[
            { key: "name", label: "Name", sortValue: (row) => row.name },
            { key: "phone", label: "Phone no" },
            { key: "gender", label: "Gender" },
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
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--admin-accent)]"
                    onClick={() => {
                      setFormError(null);
                      setDraft(row);
                    }}
                  >
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
      <AdminModal open={Boolean(detail)} title={detail ? `${detail.name} details` : "Hiring details"} onClose={() => setDetail(null)}>
        {detail ? (
          <DetailFields
            rows={[
              { label: "Name", value: detail.name },
              { label: "Phone no", value: detail.phone },
              { label: "Gender", value: detail.gender },
              { label: "Email", value: detail.email },
              { label: "Address", value: detail.address },
              { label: "Qualification", value: detail.qualification },
              { label: "Subject", value: detail.subject },
            ]}
          />
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(draft)} title={draft && hiring.some((item) => item.id === draft.id) ? "Edit hiring" : "Add hiring"} onClose={() => setDraft(null)}>
        {draft ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const message = await saveHiring({ ...draft, subject: draft.subject.trim(), name: draft.name.trim(), phone: draft.phone.trim() });
              if (message) {
                setFormError(message);
                return;
              }
              setFormError(null);
              setDraft(null);
            }}
          >
            <AdminField id="hire-name" label="Name">
              <input id="hire-name" required className={adminFieldClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            </AdminField>
            <AdminField id="hire-phone" label="Phone no">
              <input id="hire-phone" required className={adminFieldClass} value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
            </AdminField>
            <AdminField id="hire-gender" label="Gender">
              <select id="hire-gender" className={adminFieldClass} value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value as HiringCandidate["gender"] })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </AdminField>
            <AdminField id="hire-email" label="Email">
              <input id="hire-email" type="email" className={adminFieldClass} value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            </AdminField>
            <AdminField id="hire-address" label="Address">
              <input id="hire-address" className={adminFieldClass} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
            </AdminField>
            <AdminField id="hire-qualification" label="Qualification">
              <input id="hire-qualification" className={adminFieldClass} value={draft.qualification} onChange={(event) => setDraft({ ...draft, qualification: event.target.value })} />
            </AdminField>
            <AdminField id="hire-subject" label="Subject">
              <input id="hire-subject" className={adminFieldClass} value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
            </AdminField>
            {formError ? <p className="sm:col-span-2 text-sm text-[#a3361f]">{formError}</p> : null}
            <div className="sm:col-span-2 flex justify-end">
              <AdminButton type="submit">Save hiring</AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>
      <AdminModal open={Boolean(confirmId)} title="Remove hiring record" onClose={() => setConfirmId(null)}>
        <p className="text-sm text-[var(--admin-muted)]">This removes the hiring record from the register.</p>
        <div className="mt-4 flex justify-end">
          <AdminButton
            className="bg-[#a3361f]"
            onClick={async () => {
              if (!confirmId) return;
              const message = await deleteHiring(confirmId);
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
