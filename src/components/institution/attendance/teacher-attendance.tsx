"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { currentDateValue, formatAdminDate, personaFor } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

export function TeacherAttendancePage() {
  const { teachers, staff, staffPunches, staffDayMarks, punchStaff, setStaffDayMark, role, settings, portalAccount, actorId, portalName } = useAdmin();
  const today = currentDateValue();
  const owner = portalAccount === "owner" && (role === "super_admin" || role === "institution_admin");
  const signedIn = portalAccount === "teacher" || portalAccount === "staff";
  const roster = [
    ...teachers.map((teacher) => ({ id: teacher.id, name: teacher.name, kind: "Teacher" })),
    ...staff.map((member) => ({ id: member.id, name: member.name, kind: "Staff" })),
  ];
  const persona = personaFor("teacher", settings.ownerName);
  const named = roster.find((person) => person.name.toLowerCase() === persona.name.toLowerCase());
  const [chosenId, setChosenId] = useState("");
  const selectedId = roster.some((person) => person.id === chosenId) ? chosenId : (roster[0]?.id ?? "");
  const self = roster.find((person) => person.id === actorId);
  const active = signedIn ? (self ?? { id: actorId ?? "signed-in", name: portalName, kind: "Teacher" }) : owner ? roster.find((person) => person.id === selectedId) : (named ?? roster[0]);
  const teacherId = active?.id ?? "";
  const teacherName = active?.name ?? "";
  const todayPunches = staffPunches.filter((punch) => punch.teacherId === teacherId && punch.date === today);
  const punchedIn = todayPunches.some((punch) => punch.action === "in");
  const punchedOut = todayPunches.some((punch) => punch.action === "out");
  const dayStatus = staffDayMarks.find((mark) => mark.teacherId === teacherId && mark.date === today)?.status;
  const away = dayStatus === "absent" || dayStatus === "leave";

  return (
    <div className="grid gap-4">
      <AdminPageIntro icon={Clock} eyebrow="Attendance" title="Staff attendance" description="Teachers and staff mark In and Out once for today. A signed-in teacher or staff member only sees their own name." />
      <AdminPanel>
        <p className="text-sm text-[var(--admin-muted)]">Today</p>
        <p className="mt-1 text-2xl font-semibold">{formatAdminDate(today)}</p>
        {owner && roster.length > 0 ? (
          <label className="mt-4 block text-xs text-[var(--admin-muted)]">
            Teacher or staff
            <select className={`${adminFieldClass} mt-1`} value={selectedId} onChange={(event) => setChosenId(event.target.value)}>
              {roster.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {person.kind}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-3 font-medium">{teacherName}{active?.kind ? ` · ${active.kind}` : ""}</p>
        )}
        {teacherName ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <AdminButton type="button" disabled={punchedIn || away} onClick={() => punchStaff(teacherId, teacherName, "in")}>
              In
            </AdminButton>
            <AdminButton type="button" disabled={punchedOut || away} onClick={() => punchStaff(teacherId, teacherName, "out")}>
              Out
            </AdminButton>
            <AdminButton type="button" disabled={away} onClick={() => setStaffDayMark(teacherId, today, "leave")}>
              Leave
            </AdminButton>
            <AdminButton type="button" disabled={away} onClick={() => setStaffDayMark(teacherId, today, "absent")}>
              Absent
            </AdminButton>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--admin-muted)]">Add a teacher or staff member first, then their in and out times can be recorded here.</p>
        )}
      </AdminPanel>
      <AdminPanel>
        <h2 className="font-semibold">Today&apos;s record</h2>
        {away ? <p className="mt-3 text-sm font-medium capitalize">{dayStatus} for today. In and Out stay closed.</p> : null}
        {todayPunches.length === 0 && !away ? (
          <p className="mt-3 text-sm text-[var(--admin-muted)]">No in or out time yet today.</p>
        ) : todayPunches.length > 0 ? (
          <ul className="mt-3 divide-y divide-[var(--admin-line)]">
            {todayPunches.map((punch) => (
              <li key={punch.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium uppercase">{punch.action}</span>
                <span>{punch.time}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </AdminPanel>
    </div>
  );
}
