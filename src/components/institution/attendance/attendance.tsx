"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { currentDateValue, currentMonthValue, daysInMonth, formatAdminDate, viewerScope, type AttendanceStatus } from "../campus-data";
import { useAdmin } from "../campus-state";
import { downloadA4Landscape, downloadCsv, escapeHtml } from "../shared/paper";
import { AdminButton, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

type MarkCode = "" | "P" | "A" | "L";

const tabs = ["Mark attendance", "View attendance"] as const;

function letter(status: string): MarkCode {
  if (status === "absent") return "A";
  if (status === "leave") return "L";
  if (status === "present" || status === "late") return "P";
  return "";
}

function statusFrom(code: MarkCode): AttendanceStatus | null {
  if (code === "P") return "present";
  if (code === "A") return "absent";
  if (code === "L") return "leave";
  return null;
}

function codeClass(code: string) {
  if (code === "A") return "font-semibold text-[#c62828]";
  if (code === "L") return "font-semibold text-[#1565c0]";
  if (code === "P") return "font-semibold text-[#1b7f3a]";
  return "";
}

function daysUntilToday() {
  const today = currentDateValue();
  return daysInMonth(currentMonthValue()).filter((day) => day <= today);
}

function datesBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 120) {
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    days.push(`${cursor.getFullYear()}-${month}-${day}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function AttendancePage() {
  const { students, attendance, saveAttendance, reloadAttendance, classes, role, portalStudentId, settings, session } = useAdmin();
  const today = currentDateValue();
  const canMark = role === "super_admin" || role === "institution_admin" || role === "teacher";
  const [tab, setTab] = useState<(typeof tabs)[number]>("Mark attendance");
  const classNames = [...new Set(classes.map((room) => room.name))];
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const sections = [...new Set(classes.filter((room) => room.name === className).map((room) => room.section))];
  const roster = !className || !section ? [] : students.filter((student) => student.className === className && student.section === section);
  const nextKey = `${className}|${section}|${today}`;
  const [draft, setDraft] = useState<{ key: string; marks: Record<string, MarkCode> }>({ key: "", marks: {} });
  const seeded: Record<string, MarkCode> = {};
  for (const student of roster) {
    const row = attendance.find((item) => item.kind === "student" && item.personId === student.id && item.date === today);
    seeded[student.id] = row ? letter(row.status) : "";
  }
  const marks = draft.key === nextKey ? { ...seeded, ...draft.marks } : seeded;

  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [applied, setApplied] = useState<{ className: string; section: string; from: string; to: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const filterSections = [...new Set(classes.filter((room) => room.name === filterClass).map((room) => room.section))];
  const historyDays = applied ? datesBetween(applied.from, applied.to) : daysUntilToday();
  const historyStudents = applied
    ? students.filter((student) => student.className === applied.className && student.section === applied.section)
    : role === "student" || role === "parent"
      ? students.filter((student) => (role === "student" ? student.id === portalStudentId : viewerScope.parentStudentIds.includes(student.id)))
      : [];
  const showHistory = Boolean(applied) || role === "student" || role === "parent";

  function codeFor(studentId: string, date: string) {
    const row = attendance.find((item) => item.kind === "student" && item.personId === studentId && item.date === date);
    return row ? letter(row.status) : "";
  }

  function sheetRows() {
    const header = ["Student", ...historyDays.map((day) => formatAdminDate(day))];
    const body = historyStudents.map((student) => [student.name, ...historyDays.map((day) => codeFor(student.id, day) || "-")]);
    return [header, ...body];
  }

  function downloadPdf() {
    const head = historyDays.map((day) => `<th>${escapeHtml(formatAdminDate(day))}</th>`).join("");
    const body = historyStudents
      .map((student) => {
        const cells = historyDays
          .map((day) => {
            const code = codeFor(student.id, day) || "-";
            const color = code === "A" ? "#c62828" : code === "L" ? "#1565c0" : code === "P" ? "#1b7f3a" : "#6b7280";
            return `<td style="color:${color};font-weight:700">${code}</td>`;
          })
          .join("");
        return `<tr><th>${escapeHtml(student.name)}</th>${cells}</tr>`;
      })
      .join("");
    const title = applied ? `${applied.className} · ${applied.section}` : "Student attendance";
    downloadA4Landscape("Student attendance", `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(settings.institutionName)} · ${escapeHtml(currentMonthValue())}</p><table><thead><tr><th>Student</th>${head}</tr></thead><tbody>${body}</tbody></table>`);
  }

  useEffect(() => {
    void reloadAttendance();
  }, [session?.institutionId]);

  const ready = roster.length > 0 && roster.every((student) => marks[student.id]);

  return (
    <div className="grid gap-4">
      <AdminPageIntro icon={ClipboardCheck} eyebrow="Attendance" title="Student attendance" description="Choose the class and section, mark P, A, or L for today, then save. Earlier days stay as they were." />
      {canMark ? (
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={item === tab ? "rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-full bg-[var(--admin-surface)] px-4 py-2 text-sm ring-1 ring-[var(--admin-line)]"}>
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {canMark && tab === "Mark attendance" ? (
        <AdminPanel>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs text-[var(--admin-muted)]">
              Class
              <select
                className={`${adminFieldClass} mt-1`}
                value={className}
                onChange={(event) => {
                  setClassName(event.target.value);
                  setSection("");
                }}
              >
                <option value="">Select a class</option>
                {classNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--admin-muted)]">
              Section
              <select className={`${adminFieldClass} mt-1`} value={section} onChange={(event) => setSection(event.target.value)}>
                <option value="">Select a section</option>
                {sections.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <p className="text-xs text-[var(--admin-muted)]">
              Date
              <span className={`${adminFieldClass} mt-1 block w-auto`}>{formatAdminDate(today)}</span>
            </p>
          </div>
          {className && !section ? <p className="mt-4 text-sm text-[var(--admin-muted)]">Select a section. Every student in that class and section will appear here.</p> : null}
          {className && section && roster.length === 0 ? <p className="mt-4 text-sm text-[var(--admin-muted)]">No students in this class and section.</p> : null}
          {roster.length > 0 ? (
            <>
              <ul className="mt-4 divide-y divide-[var(--admin-line)]">
                {roster.map((student) => (
                  <li key={student.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <p className="font-medium">{student.name}</p>
                    <select
                      aria-label={`${student.name} attendance`}
                      className={`${adminFieldClass} w-28 ${codeClass(marks[student.id] ?? "")}`}
                      value={marks[student.id] ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          key: nextKey,
                          marks: { ...(current.key === nextKey ? current.marks : {}), [student.id]: event.target.value as MarkCode },
                        }))
                      }
                    >
                      <option value="">Mark</option>
                      <option value="A">A</option>
                      <option value="P">P</option>
                      <option value="L">L</option>
                    </select>
                  </li>
                ))}
              </ul>
              {saveError ? <p className="mt-3 text-sm text-[#a3361f]">{saveError}</p> : null}
              <AdminButton
                className="mt-4"
                disabled={!ready}
                onClick={async () => {
                  const message = await saveAttendance(
                    roster.map((student) => ({
                      date: today,
                      personId: student.id,
                      personName: student.name,
                      kind: "student" as const,
                      className,
                      section: student.section,
                      status: statusFrom(marks[student.id]) ?? "present",
                    })),
                  );
                  setSaveError(message);
                }}
              >
                Save
              </AdminButton>
            </>
          ) : null}
        </AdminPanel>
      ) : null}

      {!canMark || tab === "View attendance" ? (
        <AdminPanel>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">View attendance</h2>
            <p className="text-xs text-[var(--admin-muted)]">
              <span className="font-semibold text-[#1b7f3a]">P</span> present · <span className="font-semibold text-[#c62828]">A</span> absent · <span className="font-semibold text-[#1565c0]">L</span> leave
            </p>
          </div>
          {canMark ? (
            <div className="mb-4 flex flex-wrap items-end gap-3">
              <label className="text-xs text-[var(--admin-muted)]">
                Class
                <select
                  className={`${adminFieldClass} mt-1`}
                  value={filterClass}
                  onChange={(event) => {
                    setFilterClass(event.target.value);
                    setFilterSection("");
                  }}
                >
                  <option value="">Select a class</option>
                  {classNames.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Section
                <select className={`${adminFieldClass} mt-1`} value={filterSection} onChange={(event) => setFilterSection(event.target.value)}>
                  <option value="">Select a section</option>
                  {filterSections.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Date from
                <input type="date" max={filterTo || today} className={`${adminFieldClass} mt-1`} value={filterFrom} onChange={(event) => setFilterFrom(event.target.value)} />
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Date to
                <input type="date" min={filterFrom || undefined} max={today} className={`${adminFieldClass} mt-1`} value={filterTo} onChange={(event) => setFilterTo(event.target.value)} />
              </label>
              <AdminButton
                type="button"
                disabled={!filterClass || !filterSection || !filterFrom || !filterTo || filterFrom > filterTo || datesBetween(filterFrom, filterTo).at(-1) !== filterTo}
                onClick={async () => {
                  await reloadAttendance();
                  setApplied({ className: filterClass, section: filterSection, from: filterFrom, to: filterTo });
                }}
              >
                Apply filter
              </AdminButton>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm"
                onClick={() => {
                  setApplied(null);
                  setFilterClass("");
                  setFilterSection("");
                  setFilterFrom("");
                  setFilterTo("");
                }}
              >
                Clear filter
              </button>
              {showHistory ? (
                <>
                  <AdminButton type="button" onClick={() => downloadCsv(`student-attendance-${currentMonthValue()}.csv`, sheetRows())}>
                    Download CSV
                  </AdminButton>
                  <AdminButton type="button" onClick={downloadPdf}>
                    Download PDF
                  </AdminButton>
                </>
              ) : null}
            </div>
          ) : null}
          {!canMark && showHistory ? (
            <div className="mb-4 flex flex-wrap gap-2">
              <AdminButton type="button" onClick={() => downloadCsv(`student-attendance-${currentMonthValue()}.csv`, sheetRows())}>
                Download CSV
              </AdminButton>
              <AdminButton type="button" onClick={downloadPdf}>
                Download PDF
              </AdminButton>
            </div>
          ) : null}
          {filterFrom && filterTo && filterFrom <= filterTo && datesBetween(filterFrom, filterTo).at(-1) !== filterTo ? <p className="mb-3 text-sm text-[#a3361f]">Choose a range of 120 days or fewer.</p> : null}
          {!showHistory ? <p className="text-sm text-[var(--admin-muted)]">Select the class, section, date from, and date to, then apply the filter. Every student in that class appears, with a date column on top and the status underneath. A day with no attendance shows -.</p> : null}
          {showHistory && historyStudents.length === 0 ? <p className="text-sm text-[var(--admin-muted)]">No students match this filter.</p> : null}
          {showHistory && historyStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-[0.08em] text-[var(--admin-muted)] uppercase">
                    <th className="sticky left-0 bg-[var(--admin-surface)] px-2 py-2">Student</th>
                    {historyDays.map((day) => (
                      <th key={day} className="px-2 py-2">
                        {formatAdminDate(day).replace(` ${day.slice(0, 4)}`, "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyStudents.map((student) => (
                    <tr key={student.id} className="border-t border-[var(--admin-line)]">
                      <th className="sticky left-0 bg-[var(--admin-surface)] px-2 py-2 text-left font-medium">{student.name}</th>
                      {historyDays.map((day) => {
                        const code = codeFor(student.id, day);
                        return (
                          <td key={day} className={`px-2 py-2 ${codeClass(code)}`}>
                            {code || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </AdminPanel>
      ) : null}
    </div>
  );
}
