"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { currentDateValue, type SittingRoom, type SittingSeat } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, adminFieldClass } from "../shared/fields";

function assignSeats(students: { id: string; name: string }[], rooms: SittingRoom[]): SittingSeat[] {
  const ordered = [...students].sort((left, right) => left.name.localeCompare(right.name));
  const seats: SittingSeat[] = [];
  let index = 0;
  for (const room of rooms) {
    for (let seatNo = 1; seatNo <= room.count && index < ordered.length; seatNo += 1) {
      const student = ordered[index];
      index += 1;
      seats.push({ studentId: student.id, studentName: student.name, room: room.room, seatNo });
    }
  }
  return seats;
}

export function ExamsPage() {
  const { classes, students, sittingPlans, saveSittingPlan, deleteSittingPlan, role } = useAdmin();
  const canEdit = role === "super_admin" || role === "institution_admin" || role === "teacher";
  const classNames = [...new Set(classes.map((room) => room.name))];
  const [open, setOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");
  const [count, setCount] = useState("");
  const [rooms, setRooms] = useState<SittingRoom[]>([]);
  const [error, setError] = useState("");
  const sections = [...new Set(classes.filter((item) => item.name === className).map((item) => item.section))];
  const roster = students.filter((student) => student.status === "active" && student.className === className && (!section || student.section === section) && Boolean(className) && Boolean(section));
  const assigned = rooms.reduce((sum, item) => sum + item.count, 0);
  const remaining = Math.max(roster.length - assigned, 0);

  function reset() {
    setClassName("");
    setSection("");
    setRoom("");
    setCount("");
    setRooms([]);
    setError("");
  }

  function addRoom() {
    const next = Number(count);
    const label = room.trim();
    if (!label) {
      setError("Enter the room number.");
      return;
    }
    if (!Number.isInteger(next) || next < 1) {
      setError("Enter how many students sit in this room.");
      return;
    }
    if (rooms.some((item) => item.room.toLowerCase() === label.toLowerCase())) {
      setError("That room is already in the plan.");
      return;
    }
    if (next > remaining) {
      setError(remaining === 0 ? "Every student already has a room." : `Only ${remaining} students are still unassigned.`);
      return;
    }
    const nextRooms = [...rooms, { room: label, count: next }];
    const left = roster.length - nextRooms.reduce((sum, item) => sum + item.count, 0);
    setRooms(nextRooms);
    setRoom("");
    setCount(left > 0 ? String(left) : "");
    setError("");
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={BookOpen}
        eyebrow="Academics"
        title="Exam sitting plan"
        description="Split a class across rooms. Each student gets a room number and a seat number."
        action={
          canEdit ? (
            <AdminButton
              onClick={() => {
                reset();
                setOpen(true);
              }}
            >
              Create examination
            </AdminButton>
          ) : null
        }
      />
      {sittingPlans.length === 0 ? (
        <AdminPanel>
          <p className="text-sm text-[var(--admin-muted)]">No sitting plan yet. Create one for a class and section.</p>
        </AdminPanel>
      ) : (
        sittingPlans.map((plan) => (
          <AdminPanel key={plan.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">
                  {plan.className} · {plan.section}
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">{plan.rooms.map((item) => `${item.room}: ${item.count} students`).join(" · ")}</p>
              </div>
              {canEdit ? (
                <button type="button" className="text-xs font-semibold text-[#a3361f]" onClick={() => deleteSittingPlan(plan.id)}>
                  Delete
                </button>
              ) : null}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-[0.08em] text-[var(--admin-muted)] uppercase">
                    <th className="px-2 py-2">Student</th>
                    <th className="px-2 py-2">Room no</th>
                    <th className="px-2 py-2">Seat no</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.seats.map((seat) => (
                    <tr key={seat.studentId} className="border-t border-[var(--admin-line)]">
                      <td className="px-2 py-2 font-medium">{seat.studentName}</td>
                      <td className="px-2 py-2">{seat.room}</td>
                      <td className="px-2 py-2">{seat.seatNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPanel>
        ))
      )}
      <AdminModal
        open={open}
        title="Sitting plan"
        onClose={() => {
          setOpen(false);
          reset();
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!className || !section) {
              setError("Choose the class and section.");
              return;
            }
            if (roster.length === 0) {
              setError("This class and section has no students.");
              return;
            }
            if (rooms.length === 0 || remaining !== 0) {
              setError(remaining === roster.length ? "Add at least one room." : `${remaining} students still need a room.`);
              return;
            }
            saveSittingPlan({
              id: `sit-${Date.now()}`,
              className,
              section,
              rooms,
              seats: assignSeats(roster, rooms),
              createdOn: currentDateValue(),
            });
            setOpen(false);
            reset();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField id="sit-class" label="Class">
              <select
                id="sit-class"
                required
                className={adminFieldClass}
                value={className}
                onChange={(event) => {
                  setClassName(event.target.value);
                  setSection("");
                  setRooms([]);
                  setCount("");
                  setError("");
                }}
              >
                <option value="">{classNames.length === 0 ? "Add a class in Academics first" : "Select a class"}</option>
                {classNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </AdminField>
            <AdminField id="sit-section" label="Section">
              <select
                id="sit-section"
                required
                className={adminFieldClass}
                value={section}
                onChange={(event) => {
                  const nextSection = event.target.value;
                  setSection(nextSection);
                  setRooms([]);
                  const size = students.filter((student) => student.status === "active" && student.className === className && student.section === nextSection).length;
                  setCount(size > 0 ? String(size) : "");
                  setError("");
                }}
              >
                <option value="">Select a section</option>
                {sections.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </AdminField>
          </div>
          {className && section ? <p className="text-sm text-[var(--admin-muted)]">{roster.length} students in this class and section. {remaining} still need a room.</p> : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
            <AdminField id="sit-room" label="Room">
              <input id="sit-room" className={adminFieldClass} value={room} placeholder="Room 1" onChange={(event) => setRoom(event.target.value)} />
            </AdminField>
            <AdminField id="sit-count" label="Students">
              <input id="sit-count" type="number" min={1} className={adminFieldClass} value={count} onChange={(event) => setCount(event.target.value)} />
            </AdminField>
            <AdminButton type="button" onClick={addRoom}>
              Add room
            </AdminButton>
          </div>
          {rooms.length > 0 ? (
            <ul className="divide-y divide-[var(--admin-line)] rounded-xl ring-1 ring-[var(--admin-line)]">
              {rooms.map((item) => (
                <li key={item.room} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>
                    {item.room} · {item.count} students
                  </span>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#a3361f]"
                    onClick={() => {
                      const nextRooms = rooms.filter((roomItem) => roomItem.room !== item.room);
                      const left = roster.length - nextRooms.reduce((sum, roomItem) => sum + roomItem.count, 0);
                      setRooms(nextRooms);
                      setCount(left > 0 ? String(left) : "");
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
          <div className="flex justify-end">
            <AdminButton type="submit">Generate sitting plan</AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
