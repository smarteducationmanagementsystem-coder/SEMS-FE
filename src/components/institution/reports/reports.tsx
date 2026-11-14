"use client";

import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { attendanceRate, buildResults, deriveFeeStatus, feeBalance, feeTotal, formatMoney } from "../campus-data";
import { downloadCsv, printDocument } from "../campus-export";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

const reportTypes = [
  "Monthly performance",
  "Monthly attendance",
  "Monthly fee collection",
  "Pending fees",
  "Academic progress",
  "Staff attendance",
  "Class summary",
] as const;

export function ReportsPage() {
  const { students, attendance, fees, exams, marks, classes, settings } = useAdmin();
  const [type, setType] = useState<(typeof reportTypes)[number]>("Monthly fee collection");
  const [month, setMonth] = useState("2026-11");
  const [className, setClassName] = useState("all");
  const [session, setSession] = useState("2026–27");
  const [studentId, setStudentId] = useState("all");
  const classOptions = [...new Set(classes.map((room) => room.name))];

  const table = useMemo(() => {
    const inClass = (name: string) => className === "all" || name === className;
    const studentOk = (id: string) => studentId === "all" || id === studentId;
    if (type === "Monthly fee collection" || type === "Pending fees") {
      const rows = fees.filter((fee) => fee.month === month && inClass(fee.className) && studentOk(fee.studentId) && (type === "Monthly fee collection" || deriveFeeStatus(fee) !== "paid"));
      return {
        head: ["Challan", "Student", "Class", "Billed", "Paid", "Balance", "Status"],
        body: rows.map((fee) => [fee.challanNo, fee.studentName, fee.className, formatMoney(feeTotal(fee)), formatMoney(fee.paid), formatMoney(feeBalance(fee)), deriveFeeStatus(fee)]),
      };
    }
    if (type === "Monthly attendance" || type === "Staff attendance") {
      const kind = type === "Staff attendance" ? "staff" : "student";
      const grouped = new Map<string, { name: string; rows: typeof attendance }>();
      for (const row of attendance) {
        if (row.kind !== kind || !row.date.startsWith(month)) continue;
        if (kind === "student" && (!inClass(row.className) || !studentOk(row.personId))) continue;
        const current = grouped.get(row.personId) ?? { name: row.personName, rows: [] };
        current.rows.push(row);
        grouped.set(row.personId, current);
      }
      return {
        head: ["Name", "Marked days", "Present or late", "Rate"],
        body: [...grouped.values()].map((item) => [item.name, String(item.rows.length), String(item.rows.filter((row) => row.status === "present" || row.status === "late").length), `${attendanceRate(item.rows)}%`]),
      };
    }
    if (type === "Monthly performance" || type === "Academic progress" || type === "Class summary") {
      const exam = exams.find((item) => (className === "all" || item.className === className) && item.session === session) ?? exams[0];
      const lines = exam ? buildResults(marks, exam.id, className === "all" ? undefined : className).filter((line) => studentOk(line.studentId)) : [];
      return {
        head: ["Position", "Student", "Class", "Obtained", "Percent", "Grade"],
        body: lines.map((line) => [String(line.position), line.studentName, line.className, `${line.obtained}/${line.total}`, `${line.percent}%`, line.grade]),
      };
    }
    return { head: ["Note"], body: [["Choose a report."]] };
  }, [type, month, className, session, studentId, fees, attendance, exams, marks]);

  function exportRows() {
    return [table.head, ...table.body];
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro icon={BarChart3} eyebrow="Insights" title="Reports" description="Filter by month, session, class, or student, then print a PDF or download a spreadsheet." />
      <AdminPanel>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <label className="text-xs text-[var(--admin-muted)]">Report
            <select className={`${adminFieldClass} mt-1`} value={type} onChange={(event) => setType(event.target.value as (typeof reportTypes)[number])}>
              {reportTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs text-[var(--admin-muted)]">Month
            <input type="month" className={`${adminFieldClass} mt-1`} value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
          <label className="text-xs text-[var(--admin-muted)]">Session
            <input className={`${adminFieldClass} mt-1`} value={session} onChange={(event) => setSession(event.target.value)} />
          </label>
          <label className="text-xs text-[var(--admin-muted)]">Class
            <select className={`${adminFieldClass} mt-1`} value={className} onChange={(event) => setClassName(event.target.value)}>
              <option value="all">All classes</option>
              {classOptions.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-xs text-[var(--admin-muted)]">Student
            <select className={`${adminFieldClass} mt-1`} value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="all">All students</option>
              {students.filter((student) => className === "all" || student.className === className).map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminButton onClick={() => downloadCsv(`${type.replaceAll(" ", "-").toLowerCase()}.csv`, exportRows())}>Download Excel</AdminButton>
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 ring-[var(--admin-line)]"
            onClick={() =>
              printDocument(
                type,
                `<h1>${settings.institutionName}</h1><p class="muted">${type} · ${month} · ${session}</p><table><tr>${table.head.map((cell) => `<th>${cell}</th>`).join("")}</tr>${table.body
                  .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
                  .join("")}</table>`,
              )
            }
          >
            Download PDF
          </button>
        </div>
      </AdminPanel>
      <AdminPanel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-line)] text-[11px] tracking-[0.12em] text-[var(--admin-muted)] uppercase">
                {table.head.map((cell) => <th key={cell} className="px-3 py-3">{cell}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.body.map((row, index) => (
                <tr key={index} className="border-b border-[var(--admin-line)] last:border-0">
                  {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {table.body.length === 0 ? <p className="py-8 text-center text-sm text-[var(--admin-muted)]">Nothing matches these filters.</p> : null}
        </div>
      </AdminPanel>
    </div>
  );
}
