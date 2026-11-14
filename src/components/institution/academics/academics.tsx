"use client";

import { useState } from "react";
import { Library } from "lucide-react";
import type { ClassRoom, Subject } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, AdminTable, adminFieldClass } from "../shared/fields";
import { MarksheetBoard } from "./marksheet";
import { ResultBoard } from "./result-board";
import { TimetableBoard } from "./timetable-board";

const tabs = ["Classes", "Subjects", "Generate time table", "Generate result", "Generate marksheet"] as const;

function classLabel(room: Pick<ClassRoom, "name" | "section">) {
  return room.section.trim() ? `${room.name} · ${room.section}` : room.name;
}

const blankClass = (): ClassRoom => ({
  id: `cls-${Date.now()}`,
  name: "",
  section: "",
  session: "",
  teacher: "",
  room: "",
});

const blankSubject = (): Subject => ({
  id: `sub-${Date.now()}`,
  name: "",
  code: "",
  className: "",
  teacher: "",
  weeklyPeriods: 0,
});

export function AcademicsPage() {
  const {
    classes,
    saveClass,
    deleteClass,
    subjects,
    saveSubject,
    deleteSubject,
    teachers,
    students,
    query,
    role,
  } = useAdmin();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Classes");
  const [room, setRoom] = useState<ClassRoom | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [openClassId, setOpenClassId] = useState<string | null>(null);
  const readOnly = role === "teacher";
  const openClass = classes.find((item) => item.id === openClassId) ?? null;
  const classStudents = openClass
    ? students.filter((student) => student.className === openClass.name && student.section === openClass.section)
    : [];

  return (
    <div className="grid gap-4">
      <AdminPageIntro icon={Library} eyebrow="Academics" title="Classes, subjects, and timetable" description="Add classes and subjects, generate a timetable, a result sheet, or a blank award list." />
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={item === tab ? "rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-full bg-[var(--admin-surface)] px-4 py-2 text-sm ring-1 ring-[var(--admin-line)]"}>
            {item}
          </button>
        ))}
      </div>

      {tab === "Classes" ? (
        <AdminPanel>
          {!readOnly ? (
            <AdminButton className="mb-4" onClick={() => { setClassError(null); setRoom(blankClass()); }}>
              Add class
            </AdminButton>
          ) : null}
          {classError ? <p className="mb-3 text-sm text-[#a3361f]">{classError}</p> : null}
          {classes.length === 0 ? <p className="text-sm text-[var(--admin-muted)]">No classes yet.</p> : null}
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {classes.map((item) => {
              const count = students.filter((student) => student.className === item.name && student.section === item.section).length;
              const selected = openClassId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenClassId(selected ? null : item.id)}
                    className={`w-full rounded-2xl px-4 py-4 text-left ring-1 ${selected ? "bg-[var(--admin-accent)] text-white ring-transparent" : "bg-[var(--admin-surface-2)] ring-[var(--admin-line)]"}`}
                  >
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className={`mt-1 text-sm ${selected ? "text-white/80" : "text-[var(--admin-muted)]"}`}>Section {item.section}</p>
                    {item.teacher ? <p className={`mt-2 text-sm ${selected ? "text-white/90" : ""}`}>Teacher: {item.teacher}</p> : null}
                    {item.room ? <p className={`text-sm ${selected ? "text-white/90" : ""}`}>Room: {item.room}</p> : null}
                    <p className={`mt-3 text-xs font-semibold tracking-wide uppercase ${selected ? "text-white/80" : "text-[var(--admin-accent)]"}`}>
                      {count} {count === 1 ? "student" : "students"}
                    </p>
                  </button>
                  {!readOnly ? (
                    <span className="mt-2 flex gap-3 px-1">
                      <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => { setClassError(null); setRoom(item); }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#a3361f]"
                        onClick={async () => {
                          const message = await deleteClass(item.id);
                          if (message) {
                            setClassError(message);
                            return;
                          }
                          if (openClassId === item.id) setOpenClassId(null);
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {openClass ? (
            <div className="mt-5 rounded-2xl bg-[var(--admin-surface-2)] p-4">
              <p className="font-semibold">Students in {classLabel(openClass)}</p>
              {classStudents.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--admin-muted)]">No students admitted to this class yet. Admit them from the Students page.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--admin-line)]">
                  {classStudents.map((student) => (
                    <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-[var(--admin-muted)]">{student.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </AdminPanel>
      ) : null}

      {tab === "Subjects" ? (
        <AdminPanel>
          {!readOnly ? (
            <AdminButton className="mb-4" onClick={() => { setSubjectError(null); setSubject(blankSubject()); }}>
              Add subject
            </AdminButton>
          ) : null}
          {subjectError ? <p className="mb-3 text-sm text-[#a3361f]">{subjectError}</p> : null}
          <AdminTable
            rows={subjects}
            query={query}
            empty="No subjects yet."
            columns={[
              { key: "name", label: "Subject" },
              { key: "className", label: "Class" },
              { key: "teacher", label: "Teacher" },
              {
                key: "actions",
                label: "",
                render: (row) =>
                  readOnly ? null : (
                    <span className="flex justify-end gap-2">
                      <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => { setSubjectError(null); setSubject(row); }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#a3361f]"
                        onClick={async () => {
                          const message = await deleteSubject(row.id);
                          if (message) setSubjectError(message);
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  ),
              },
            ]}
          />
        </AdminPanel>
      ) : null}

      {tab === "Generate time table" ? <TimetableBoard readOnly={readOnly} /> : null}
      {tab === "Generate result" ? <ResultBoard /> : null}
      {tab === "Generate marksheet" ? <MarksheetBoard /> : null}

      <AdminModal open={Boolean(room)} title="Class" onClose={() => setRoom(null)}>
        {room ? (
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const message = await saveClass({ ...room, name: room.name.trim(), section: room.section.trim(), teacher: room.teacher.trim(), room: room.room.trim() });
              if (message) {
                setClassError(message);
                return;
              }
              setClassError(null);
              setRoom(null);
            }}
          >
            <AdminField id="cname" label="Class name">
              <input id="cname" required className={adminFieldClass} value={room.name} onChange={(event) => setRoom({ ...room, name: event.target.value })} />
            </AdminField>
            <AdminField id="section" label="Section">
              <input id="section" required className={adminFieldClass} value={room.section} onChange={(event) => setRoom({ ...room, section: event.target.value })} />
            </AdminField>
            <AdminField id="teacher" label="Class teacher">
              <input id="teacher" className={adminFieldClass} value={room.teacher} onChange={(event) => setRoom({ ...room, teacher: event.target.value })} />
            </AdminField>
            <AdminField id="room" label="Room">
              <input id="room" className={adminFieldClass} value={room.room} onChange={(event) => setRoom({ ...room, room: event.target.value })} />
            </AdminField>
            {classError ? <p className="text-sm text-[#a3361f]">{classError}</p> : null}
            <AdminButton type="submit">Save class</AdminButton>
          </form>
        ) : null}
      </AdminModal>

      <AdminModal open={Boolean(subject)} title="Subject" onClose={() => setSubject(null)}>
        {subject ? (
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const selected = classes.find((item) => item.id === subject.className) ?? classes.find((item) => classLabel(item) === subject.className);
              const message = await saveSubject({
                ...subject,
                name: subject.name.trim(),
                className: selected ? classLabel(selected) : subject.className.trim(),
                teacher: subject.teacher.trim(),
              });
              if (message) {
                setSubjectError(message);
                return;
              }
              setSubjectError(null);
              setSubject(null);
            }}
          >
            <AdminField id="sname" label="Name">
              <input id="sname" required className={adminFieldClass} value={subject.name} onChange={(event) => setSubject({ ...subject, name: event.target.value })} />
            </AdminField>
            <AdminField id="sclass" label="Class">
              <select
                id="sclass"
                className={adminFieldClass}
                value={classes.find((item) => classLabel(item) === subject.className)?.id ?? subject.className}
                onChange={(event) => setSubject({ ...subject, className: event.target.value })}
              >
                <option value="">Select a class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {classLabel(item)}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField id="steacher" label="Teacher">
              <select id="steacher" className={adminFieldClass} value={subject.teacher} onChange={(event) => setSubject({ ...subject, teacher: event.target.value })}>
                <option value="">Select a teacher</option>
                {teachers.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </AdminField>
            {subjectError ? <p className="text-sm text-[#a3361f]">{subjectError}</p> : null}
            <AdminButton type="submit">Save subject</AdminButton>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
