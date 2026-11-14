"use client";

import Link from "next/link";
import { routes } from "@/constants/routes";
import {
  currentDateValue,
  currentMonthValue,
  feeBalance,
  feeTotal,
  formatMoney,
  listedFeeStatus,
  personaFor,
  viewerScope,
  type RoleId,
} from "../campus-data";
import { useAdmin } from "../campus-state";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthTitle(month: string) {
  const [year, index] = month.split("-");
  const name = monthNames[Number(index) - 1];
  return name && year ? `${name} ${year}` : month;
}

function rate(present: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((present / total) * 100);
}

const cardTones = {
  blue: { light: { bg: "#dbeafe", text: "#1e3a8a", note: "#1d4ed8" }, dark: { bg: "#1e3a8a", text: "#eff6ff", note: "#bfdbfe" } },
  purple: { light: { bg: "#ede9fe", text: "#4c1d95", note: "#6d28d9" }, dark: { bg: "#4c1d95", text: "#f5f3ff", note: "#ddd6fe" } },
  pink: { light: { bg: "#fce7f3", text: "#831843", note: "#be185d" }, dark: { bg: "#831843", text: "#fdf2f8", note: "#fbcfe8" } },
  teal: { light: { bg: "#ccfbf1", text: "#134e4a", note: "#0f766e" }, dark: { bg: "#115e59", text: "#f0fdfa", note: "#99f6e4" } },
  green: { light: { bg: "#dcfce7", text: "#14532d", note: "#15803d" }, dark: { bg: "#14532d", text: "#f0fdf4", note: "#bbf7d0" } },
  orange: { light: { bg: "#ffedd5", text: "#7c2d12", note: "#c2410c" }, dark: { bg: "#9a3412", text: "#fff7ed", note: "#fed7aa" } },
  indigo: { light: { bg: "#e0e7ff", text: "#312e81", note: "#4338ca" }, dark: { bg: "#312e81", text: "#eef2ff", note: "#c7d2fe" } },
  amber: { light: { bg: "#fef3c7", text: "#78350f", note: "#b45309" }, dark: { bg: "#78350f", text: "#fffbeb", note: "#fde68a" } },
} as const;

export function DashboardPage() {
  const { students, teachers, staff, classes, fees, attendance, role, settings, portalStudentId, portalTeacherClass, portalAccount, portalName, staffPunches, staffDayMarks, theme } = useAdmin();
  const persona =
    portalAccount === "owner"
      ? personaFor(role, settings.ownerName)
      : {
          label: portalAccount === "student" ? "Student" : portalAccount === "staff" ? "Staff" : "Teacher",
          name: portalName || "Portal",
          title: portalAccount === "student" ? "Student" : portalAccount === "staff" ? "Staff" : "Teacher",
        };
  const scopedStudents =
    role === "student" ? students.filter((student) => student.id === portalStudentId) : role === "parent" ? students.filter((student) => viewerScope.parentStudentIds.includes(student.id)) : role === "teacher" ? students.filter((student) => student.className === portalTeacherClass) : students;
  const today = currentDateValue();
  const month = currentMonthValue();
  const monthLabel = monthTitle(month);
  const monthFees = fees.filter((fee) => fee.month === month && scopedStudents.some((student) => student.id === fee.studentId));
  const paidFees = monthFees.filter((fee) => listedFeeStatus(fee) === "paid");
  const pendingFees = monthFees.filter((fee) => listedFeeStatus(fee) !== "paid");
  const paidTotal = paidFees.reduce((sum, fee) => sum + (fee.paid > 0 ? fee.paid : feeTotal(fee)), 0);
  const pendingTotal = pendingFees.reduce((sum, fee) => sum + feeBalance(fee), 0);
  const attendanceRoster = scopedStudents.filter((student) => student.status === "active");
  const studentsPresent = attendanceRoster.filter((student) =>
    attendance.some((row) => row.kind === "student" && row.date === today && row.personId === student.id && (row.status === "present" || row.status === "late")),
  ).length;
  const campusPeople = [
    ...teachers.filter((teacher) => teacher.status === "active").map((teacher) => teacher.id),
    ...staff.filter((member) => member.status === "active").map((member) => member.id),
  ];
  const staffPresent = campusPeople.filter((personId) => {
    const mark = staffDayMarks.find((item) => item.teacherId === personId && item.date === today);
    if (mark?.status === "absent" || mark?.status === "leave") return false;
    if (mark?.status === "present" || mark?.status === "late") return true;
    return staffPunches.some((punch) => punch.teacherId === personId && punch.date === today && punch.action === "in");
  }).length;
  const activeStudents = attendanceRoster.length;

  const mode = theme === "dark" ? "dark" : "light";
  const cards = [
    { label: "Total students", value: String(role === "student" || role === "parent" ? scopedStudents.length : students.filter((student) => student.status === "active").length), note: role === "teacher" ? portalTeacherClass : "Active", tone: cardTones.blue[mode] },
    { label: "Total teachers", value: String(teachers.filter((teacher) => teacher.status === "active").length), note: "On campus", tone: cardTones.purple[mode] },
    { label: "Total staff", value: String(staff.length), note: "Employees", tone: cardTones.pink[mode] },
    { label: "Total classes", value: String(classes.length), note: "Sections", tone: cardTones.teal[mode] },
    { label: "Paid fee", value: formatMoney(paidTotal), note: `${paidFees.length} students`, tone: cardTones.green[mode] },
    { label: "Pending fee", value: formatMoney(pendingTotal), note: `${pendingFees.length} students`, tone: cardTones.orange[mode] },
    { label: "Student attendance", value: `${rate(studentsPresent, attendanceRoster.length)}%`, note: "Today", tone: cardTones.indigo[mode] },
    { label: "Staff attendance", value: `${rate(staffPresent, campusPeople.length)}%`, note: "Today", tone: cardTones.amber[mode] },
  ];

  return (
    <div className="grid min-w-0 gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">{persona.label}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Good afternoon, {role === "institution_admin" ? settings.institutionName : persona.name.split(" ")[0]}.</h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">{role === "institution_admin" ? "Institution account" : persona.title}. {monthLabel} campus snapshot for {activeStudents} students in view.</p>
        </div>
        {!(["super_admin", "institution_admin", "accountant", "teacher"] as RoleId[]).includes(role) ? (
          <Link href={`${routes.admin}/results`} className="rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white">
            View results
          </Link>
        ) : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl px-4 py-4" style={{ backgroundColor: card.tone.bg, color: card.tone.text }}>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: card.tone.note }}>
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs" style={{ color: card.tone.note }}>
              {card.note}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
