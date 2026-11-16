"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { routes } from "@/constants/routes";
import { formatAdminDate, viewerScope, type Student } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass, DetailFields, openDatePicker, Pill } from "../shared/fields";

const emptyStudent = (): Student => ({
  id: "",
  admissionNo: "",
  name: "",
  gender: "Female",
  className: "",
  section: "",
  session: "2026–27",
  guardian: "",
  guardianPhone: "",
  email: "",
  phone: "",
  address: "",
  dob: "2012-01-01",
  status: "active",
  enrolledOn: "2026-11-06",
});

export function StudentsPage() {
  const { students, saveStudent, deleteStudent, classes, query, role, portalStudentId, portalTeacherClass } = useAdmin();
  const [classDraft, setClassDraft] = useState("all");
  const [sectionDraft, setSectionDraft] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [draft, setDraft] = useState<Student | null>(null);
  const [detail, setDetail] = useState<Student | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const canEdit = role === "super_admin" || role === "institution_admin";
  const scoped =
    role === "student"
      ? students.filter((student) => student.id === portalStudentId)
      : role === "parent"
        ? students.filter((student) => viewerScope.parentStudentIds.includes(student.id))
        : role === "teacher"
          ? students.filter((student) => student.className === portalTeacherClass)
          : students;
  const classNames = [...new Set(classes.map((room) => room.name))];
  const sectionNames = [...new Set(classes.filter((room) => classDraft === "all" || room.name === classDraft).map((room) => room.section).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const rows = scoped.filter((student) => (classFilter === "all" || student.className === classFilter) && (sectionFilter === "all" || student.section === sectionFilter));

  function update<K extends keyof Student>(key: K, value: Student[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div>
      <AdminPageIntro
        icon={GraduationCap}
        eyebrow="People"
        title="Students"
        description="Admissions, class placement, and guardian details for the current session."
        action={canEdit ? <AdminButton onClick={() => setDraft({ ...emptyStudent(), id: `stu-${Date.now()}` })}>Admit student</AdminButton> : null}
      />
      <AdminPanel>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-[var(--admin-muted)]">
            <span className="mb-1.5 block">Class</span>
            <select
              value={classDraft}
              onChange={(event) => {
                setClassDraft(event.target.value);
                setSectionDraft("all");
              }}
              className={`${adminFieldClass} h-11 w-44`}
            >
              <option value="all">All classes</option>
              {classNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[var(--admin-muted)]">
            <span className="mb-1.5 block">Section</span>
            <select value={sectionDraft} onChange={(event) => setSectionDraft(event.target.value)} className={`${adminFieldClass} h-11 w-44`}>
              <option value="all">All sections</option>
              {sectionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <AdminButton
            className="h-11"
            onClick={() => {
              setClassFilter(classDraft);
              setSectionFilter(sectionDraft);
            }}
          >
            Apply filter
          </AdminButton>
        </div>
        <AdminTable
          rows={rows}
          query={query}
          pageSize={15}
          empty="No students match this search."
          columns={[
            { key: "admissionNo", label: "Admission", sortValue: (row) => row.admissionNo },
            {
              key: "name",
              label: "Student",
              sortValue: (row) => row.name,
              render: (row) => (
                <Link href={`${routes.admin}/students/${row.id}`} className="font-semibold text-[var(--admin-accent)]">
                  {row.name}
                </Link>
              ),
            },
            { key: "className", label: "Class", render: (row) => (row.section ? `${row.className} · ${row.section}` : row.className) },
            { key: "guardian", label: "Guardian" },
            { key: "status", label: "Status", render: (row) => <Pill tone={row.status === "active" ? "good" : "neutral"}>{row.status}</Pill> },
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
            ...(canEdit
              ? [
                  {
                    key: "actions",
                    label: "Actions",
                    fit: true,
                    render: (row: Student) => (
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
                ]
              : []),
          ]}
        />
      </AdminPanel>

      <AdminModal open={Boolean(detail)} title={detail ? `${detail.name} details` : "Student details"} onClose={() => setDetail(null)}>
        {detail ? (
          <DetailFields
            rows={[
              { label: "Admission", value: detail.admissionNo },
              { label: "Full name", value: detail.name },
              { label: "Gender", value: detail.gender },
              { label: "Class", value: detail.className },
              { label: "Section", value: detail.section },
              { label: "Session", value: detail.session },
              { label: "Guardian", value: detail.guardian },
              { label: "Guardian phone", value: detail.guardianPhone },
              { label: "Email", value: detail.email },
              { label: "Phone", value: detail.phone },
              { label: "Address", value: detail.address },
              { label: "Date of birth", value: detail.dob ? formatAdminDate(detail.dob) : "" },
              { label: "Status", value: detail.status },
              { label: "Joining date", value: detail.enrolledOn ? formatAdminDate(detail.enrolledOn) : "" },
            ]}
          />
        ) : null}
      </AdminModal>

      <AdminModal open={Boolean(draft)} title={draft && students.some((student) => student.id === draft.id) ? "Edit student" : "Admit student"} onClose={() => setDraft(null)}>
        {draft ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const admissionNo = draft.admissionNo.trim() || `ADM-${Date.now().toString().slice(-6)}`;
              const message = await saveStudent({ ...draft, admissionNo });
              if (message) {
                setFormError(message);
                return;
              }
              setFormError(null);
              setDraft(null);
            }}
          >
            <AdminField id="name" label="Full name">
              <input id="name" required className={adminFieldClass} value={draft.name} onChange={(event) => update("name", event.target.value)} />
            </AdminField>
            <AdminField id="gender" label="Gender">
              <select id="gender" className={adminFieldClass} value={draft.gender} onChange={(event) => update("gender", event.target.value as Student["gender"])}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </AdminField>
            {classes.length === 0 ? (
              <AdminField id="class" label="Class">
                <select id="class" required disabled className={adminFieldClass} value="">
                  <option value="">Add a class on the Academics page first</option>
                </select>
              </AdminField>
            ) : (
              <AdminField id="class" label="Class">
                <select
                  id="class"
                  required
                  className={adminFieldClass}
                  value={classes.find((item) => item.name === draft.className && item.section === draft.section)?.id ?? ""}
                  onChange={(event) => {
                    const selected = classes.find((item) => item.id === event.target.value);
                    if (!selected) return;
                    setDraft((current) => (current ? { ...current, className: selected.name, section: selected.section } : current));
                  }}
                >
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {item.section}
                    </option>
                  ))}
                </select>
              </AdminField>
            )}
            <AdminField id="session" label="Session">
              <input id="session" className={adminFieldClass} value={draft.session} onChange={(event) => update("session", event.target.value)} />
            </AdminField>
            <AdminField id="guardian" label="Guardian">
              <input id="guardian" required className={adminFieldClass} value={draft.guardian} onChange={(event) => update("guardian", event.target.value)} />
            </AdminField>
            <AdminField id="gphone" label="Guardian phone">
              <input id="gphone" required className={adminFieldClass} value={draft.guardianPhone} onChange={(event) => update("guardianPhone", event.target.value)} />
            </AdminField>
            <AdminField id="email" label="Email">
              <input id="email" type="email" className={adminFieldClass} value={draft.email} onChange={(event) => update("email", event.target.value)} />
            </AdminField>
            <AdminField id="phone" label="Phone">
              <input id="phone" className={adminFieldClass} value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
            </AdminField>
            <AdminField id="address" label="Address">
              <input id="address" className={adminFieldClass} value={draft.address} onChange={(event) => update("address", event.target.value)} />
            </AdminField>
            <AdminField id="enrolledOn" label="Joining date">
              <input
                id="enrolledOn"
                type="date"
                required
                className={adminFieldClass}
                value={draft.enrolledOn}
                onClick={openDatePicker}
                onChange={(event) => update("enrolledOn", event.target.value)}
              />
            </AdminField>
            <AdminField id="status" label="Status">
              <select id="status" className={adminFieldClass} value={draft.status} onChange={(event) => update("status", event.target.value as Student["status"])}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </AdminField>
            {formError ? <p className="sm:col-span-2 text-sm text-[#a3361f]">{formError}</p> : null}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-xl px-4 py-2 text-sm">
                Cancel
              </button>
              <AdminButton type="submit">Save profile</AdminButton>
            </div>
          </form>
        ) : null}
      </AdminModal>

      <AdminModal open={Boolean(confirmId)} title="Remove student" onClose={() => setConfirmId(null)}>
        <p className="text-sm text-[var(--admin-muted)]">This removes the admission from the register. Fee and attendance history already recorded stays in those modules.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmId(null)} className="rounded-xl px-4 py-2 text-sm">
            Cancel
          </button>
          <AdminButton
            className="bg-[#a3361f]"
            onClick={async () => {
              if (!confirmId) return;
              const message = await deleteStudent(confirmId);
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
