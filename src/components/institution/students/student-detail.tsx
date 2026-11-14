"use client";

import Link from "next/link";
import { useState } from "react";
import { routes } from "@/constants/routes";
import { attendanceRate, buildResults, deriveFeeStatus, feeBalance, formatAdminDate, formatMoney, feeTotal } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminPanel, detailText, Pill } from "../shared/fields";

const tabs = ["Profile", "Academic", "Attendance", "Fees"] as const;

export function StudentDetailPage({ id }: { id: string }) {
  const { students, attendance, fees, marks, exams } = useAdmin();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Profile");
  const student = students.find((item) => item.id === id);

  if (!student) {
    return (
      <AdminPanel>
        <p>That student is not in the current register.</p>
        <Link href={`${routes.admin}/students`} className="mt-3 inline-flex text-sm font-semibold text-[var(--admin-accent)]">
          Back to students
        </Link>
      </AdminPanel>
    );
  }

  const history = attendance.filter((row) => row.personId === student.id).sort((a, b) => b.date.localeCompare(a.date));
  const slips = fees.filter((fee) => fee.studentId === student.id).sort((a, b) => b.month.localeCompare(a.month));
  const results = exams
    .filter((exam) => exam.className === student.className)
    .map((exam) => ({ exam, line: buildResults(marks, exam.id).find((line) => line.studentId === student.id) }))
    .filter((item) => item.line);

  return (
    <div className="grid gap-4">
      <div>
        <Link href={`${routes.admin}/students`} className="text-xs font-semibold text-[var(--admin-accent)]">
          Students
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{student.name}</h1>
        <p className="text-sm text-[var(--admin-muted)]">
          {student.admissionNo} · {student.className} {student.section} · {student.session}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={item === tab ? "rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white" : "rounded-full bg-[var(--admin-surface)] px-4 py-2 text-sm ring-1 ring-[var(--admin-line)]"}>
            {item}
          </button>
        ))}
      </div>

      {tab === "Profile" ? (
        <AdminPanel>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Gender", student.gender],
              ["Date of birth", student.dob ? formatAdminDate(student.dob) : ""],
              ["Phone", student.phone],
              ["Email", student.email],
              ["Address", student.address],
              ["Joining date", student.enrolledOn ? formatAdminDate(student.enrolledOn) : ""],
              ["Guardian", student.guardian],
              ["Guardian phone", student.guardianPhone],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] tracking-[0.14em] text-[var(--admin-muted)] uppercase">{label}</dt>
                <dd className="mt-1">{detailText(value)}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      ) : null}

      {tab === "Academic" ? (
        <div className="grid gap-3">
          {results.length === 0 ? <AdminPanel>No examination record for this class yet.</AdminPanel> : null}
          {results.map(({ exam, line }) =>
            line ? (
              <AdminPanel key={exam.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">
                    {exam.name} · {exam.session}
                  </h2>
                  <Pill tone="info">
                    {line.grade} · {line.percent}% · position {line.position}
                  </Pill>
                </div>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {line.subjects.map((subject) => (
                    <li key={subject.subject} className="flex justify-between rounded-lg bg-[var(--admin-surface-2)] px-3 py-2 text-sm">
                      <span>{subject.subject}</span>
                      <span>
                        {subject.obtained}/{subject.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </AdminPanel>
            ) : null,
          )}
        </div>
      ) : null}

      {tab === "Attendance" ? (
        <AdminPanel>
          <p className="mb-3 text-sm text-[var(--admin-muted)]">Attendance rate across the recorded days: {attendanceRate(history)}%</p>
          <ul className="divide-y divide-[var(--admin-line)]">
            {history.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-2 text-sm">
                <span>{formatAdminDate(row.date)}</span>
                <Pill tone={row.status === "present" ? "good" : row.status === "late" ? "warn" : row.status === "leave" ? "info" : "bad"}>{row.status}</Pill>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      {tab === "Fees" ? (
        <AdminPanel>
          <ul className="divide-y divide-[var(--admin-line)]">
            {slips.map((fee) => (
              <li key={fee.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{fee.challanNo}</p>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {fee.month} · billed {formatMoney(feeTotal(fee))} · paid {formatMoney(fee.paid)}
                  </p>
                </div>
                <div className="text-right">
                  <Pill tone={deriveFeeStatus(fee) === "paid" ? "good" : deriveFeeStatus(fee) === "partial" ? "warn" : "bad"}>{deriveFeeStatus(fee)}</Pill>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">Balance {formatMoney(feeBalance(fee))}</p>
                </div>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}
    </div>
  );
}
