"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { currentDateValue, currentMonthValue, daysInMonth, formatAdminDate, keptMonthRange, type StaffDayStatus } from "../campus-data";
import { useAdmin } from "../campus-state";
import { downloadA4Landscape, downloadCsv, escapeHtml } from "../shared/paper";
import { AdminButton, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

const statuses: StaffDayStatus[] = ["present", "late", "absent", "leave"];

function dayHeading(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  return `${iso.slice(-2)} ${weekday}`;
}

function cellText(lines: string[], status: string) {
  return [...lines, status].filter(Boolean).join("\n");
}

export function ViewStaffAttendancePage() {
  const { teachers, staff, staffPunches, staffDayMarks, punchStaff, setStaffDayMark, settings, role } = useAdmin();
  const [tab, setTab] = useState<"today" | "month">("today");
  const [month, setMonth] = useState(currentMonthValue());
  const today = currentDateValue();
  const monthBounds = keptMonthRange();
  const days = daysInMonth(month);
  const canMark = role === "super_admin" || role === "institution_admin";
  const people = [
    ...teachers.map((teacher) => ({ id: teacher.id, name: teacher.name, kind: "Teacher" })),
    ...staff.map((member) => ({ id: member.id, name: member.name, kind: "Staff" })),
  ];

  function linesFor(teacherId: string, date: string) {
    return staffPunches
      .filter((punch) => punch.teacherId === teacherId && punch.date === date)
      .map((punch) => `${punch.action === "in" ? "In" : "Out"} ${punch.time}`);
  }

  function statusFor(teacherId: string, date: string) {
    return staffDayMarks.find((mark) => mark.teacherId === teacherId && mark.date === date)?.status ?? "";
  }

  function sheetRows() {
    const header = ["Teacher", ...days.map((day) => formatAdminDate(day))];
    const body = people.map((person) => [person.name, ...days.map((day) => cellText(linesFor(person.id, day), statusFor(person.id, day)))]);
    return [header, ...body];
  }

  function downloadPdf() {
    const head = days.map((day) => `<th>${dayHeading(day)}<br />${formatAdminDate(day).slice(0, 6)}</th>`).join("");
    const body = people
      .map((person) => {
        const cells = days
          .map((day) => {
            const lines = linesFor(person.id, day);
            const status = statusFor(person.id, day);
            const text = [...lines, status].map((line) => `<div>${line}</div>`).join("") || "—";
            return `<td>${text}</td>`;
          })
          .join("");
        return `<tr><th>${escapeHtml(person.name)}</th>${cells}</tr>`;
      })
      .join("");
    downloadA4Landscape(
      `Staff attendance ${month}`,
      `<h1>View staff attendance</h1><p>${settings.institutionName} · ${month}</p><table><thead><tr><th>Name</th>${head}</tr></thead><tbody>${body}</tbody></table>`,
    );
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={CalendarCheck}
        eyebrow="Attendance"
        title="View staff attendance"
        description="Today lists every teacher and staff member with In and Out. The month keeps the saved times, and the owner can still mark present, late, absent, or leave."
      />
      <div className="flex gap-2">
        <button type="button" className={tab === "today" ? "rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-xl bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold ring-1 ring-[var(--admin-line)]"} onClick={() => setTab("today")}>
          Today attendance
        </button>
        <button type="button" className={tab === "month" ? "rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-xl bg-[var(--admin-surface)] px-4 py-2 text-sm font-semibold ring-1 ring-[var(--admin-line)]"} onClick={() => setTab("month")}>
          Month
        </button>
      </div>
      {tab === "today" ? (
        <AdminPanel>
          <p className="text-sm text-[var(--admin-muted)]">Today</p>
          <p className="mt-1 text-2xl font-semibold">{formatAdminDate(today)}</p>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">Keep this page open. Mark In when someone arrives and Out when they leave.</p>
          {people.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--admin-muted)]">No teachers or staff yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--admin-line)]">
              {people.map((person) => {
                const punches = staffPunches.filter((punch) => punch.teacherId === person.id && punch.date === today);
                const punchedIn = punches.some((punch) => punch.action === "in");
                const punchedOut = punches.some((punch) => punch.action === "out");
                const status = statusFor(person.id, today);
                const away = status === "absent" || status === "leave";
                return (
                  <li key={person.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-40">
                      <p className="font-medium">{person.name}</p>
                      <p className="text-xs text-[var(--admin-muted)]">{person.kind}</p>
                    </div>
                    <AdminButton type="button" disabled={!canMark || punchedIn || away} onClick={() => punchStaff(person.id, person.name, "in")}>
                      In
                    </AdminButton>
                    <AdminButton type="button" disabled={!canMark || punchedOut || away} onClick={() => punchStaff(person.id, person.name, "out")}>
                      Out
                    </AdminButton>
                    <p className="text-sm text-[var(--admin-muted)]">
                      {away ? status : punches.length === 0 ? "Not marked" : punches.map((punch) => `${punch.action === "in" ? "In" : "Out"} ${punch.time}`).join(" · ")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminPanel>
      ) : null}
      {tab === "month" ? (
      <AdminPanel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="text-xs text-[var(--admin-muted)]">
            Month
            <input type="month" min={monthBounds.previous} max={monthBounds.current} className={`${adminFieldClass} mt-1`} value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <AdminButton type="button" onClick={() => downloadCsv(`staff-attendance-${month}.csv`, sheetRows())}>
              Download CSV
            </AdminButton>
            <AdminButton type="button" onClick={downloadPdf}>
              Download PDF
            </AdminButton>
          </div>
        </div>
        {people.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--admin-muted)]">No teachers or staff yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-xs">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.08em] text-[var(--admin-muted)] uppercase">
                  <th className="sticky left-0 bg-[var(--admin-surface)] px-2 py-2">Name</th>
                  {days.map((day) => (
                    <th key={day} className="min-w-28 px-2 py-2">
                      <span className="block">{dayHeading(day)}</span>
                      <span className="font-normal normal-case">{formatAdminDate(day).replace(` ${day.slice(0, 4)}`, "")}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} className="border-t border-[var(--admin-line)]">
                    <th className="sticky left-0 bg-[var(--admin-surface)] px-2 py-2 text-left font-medium">{person.name}</th>
                    {days.map((day) => {
                      const lines = linesFor(person.id, day);
                      const status = statusFor(person.id, day);
                      return (
                        <td key={day} className="px-2 py-2 align-top">
                          {lines.length === 0 ? <p className="text-[var(--admin-muted)]">—</p> : lines.map((line, index) => <p key={`${day}-${index}`}>{line}</p>)}
                          {canMark ? (
                            <select className={`${adminFieldClass} mt-2 px-2 py-1`} value={status} aria-label={`${person.name} ${day}`} onChange={(event) => setStaffDayMark(person.id, day, event.target.value as StaffDayStatus | "")}>
                              <option value="">Mark</option>
                              {statuses.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          ) : status ? (
                            <p className="mt-1 capitalize">{status}</p>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
      ) : null}
    </div>
  );
}
