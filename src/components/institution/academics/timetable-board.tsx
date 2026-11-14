"use client";

import { useState, type CSSProperties } from "react";
import type { ClassRoom, SavedTimetable, SheetTextStyle } from "../campus-data";
import { timetableCellKey } from "../campus-data";
import { useAdmin } from "../campus-state";
import { downloadA4Landscape, downloadCsv, escapeHtml } from "../shared/paper";
import { AdminButton, AdminPanel, adminFieldClass } from "../shared/fields";
import { TextTools, isTextSelected, mergedTextStyle, targetKey, textPaint, textStyleAttr, type TextScope, type TextTarget } from "../shared/sheet-text";

function classLabel(room: Pick<ClassRoom, "name" | "section"> | undefined, fallback = "Class") {
  if (!room) return fallback;
  return room.section.trim() ? `${room.name} · ${room.section}` : room.name;
}

function fileSlug(title: string) {
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "timetable";
}

const typed: CSSProperties = { color: "inherit", fontWeight: "inherit", fontStyle: "inherit", textDecoration: "inherit", backgroundColor: "transparent" };

export function TimetableBoard({ readOnly }: { readOnly: boolean }) {
  const {
    classes,
    subjects,
    teachers,
    timetables,
    settings,
    createTimetable,
    deleteTimetable,
    addTimetableRow,
    addTimetableColumn,
    deleteTimetableRow,
    deleteTimetableColumn,
    setTimetableTime,
    setTimetableColumnClass,
    setTimetableCell,
    setTimetableTextStyle,
  } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [textScope, setTextScope] = useState<TextScope>("cell");
  const [textTarget, setTextTarget] = useState<TextTarget | null>(null);
  const [notice, setNotice] = useState("");
  const editing = timetables.find((item) => item.id === editingId) ?? null;

  function openPicker() {
    setPicked(classes.map((item) => item.id));
    setPicking(true);
  }

  function generate() {
    createTimetable(picked);
    setPicking(false);
    setEditingId(null);
    setTextTarget(null);
  }

  function labelsFor(item: SavedTimetable) {
    return item.columns.map((column) => classLabel(classes.find((room) => room.id === column.classId)));
  }

  function downloadCsvFile(item: SavedTimetable) {
    const header = ["Period", ...labelsFor(item)];
    const body = item.rows.map((row) => [
      row.time,
      ...item.columns.map((column) => {
        const cell = item.cells[timetableCellKey(row.id, column.id)];
        return [cell?.subject, cell?.teacher].filter(Boolean).join(" / ");
      }),
    ]);
    downloadCsv(`${fileSlug(item.title)}.csv`, [header, ...body]);
  }

  function downloadPdf(item: SavedTimetable) {
    const paint = (target: TextTarget) => textStyleAttr(mergedTextStyle(item.textStyles, target));
    const head = item.columns
      .map((column) => `<th${paint({ part: "header", columnId: column.id })}>${escapeHtml(classLabel(classes.find((room) => room.id === column.classId)))}</th>`)
      .join("");
    const body = item.rows
      .map((row) => {
        const cells = item.columns
          .map((column) => {
            const cell = item.cells[timetableCellKey(row.id, column.id)];
            const subject = cell?.subject || "—";
            const teacher = cell?.teacher || "—";
            return `<td${paint({ part: "mark", rowId: row.id, columnId: column.id })}>${escapeHtml(subject)}<br />${escapeHtml(teacher)}</td>`;
          })
          .join("");
        return `<tr><th${paint({ part: "name", rowId: row.id })}>${escapeHtml(row.time || "Period")}</th>${cells}</tr>`;
      })
      .join("");
    const names = labelsFor(item).join(", ");
    downloadA4Landscape(
      item.title,
      `<h1>${escapeHtml(settings.institutionName)}</h1><p>${escapeHtml(names || item.title)}</p><table><thead><tr><th${paint({ part: "label", field: "name" })}>Period</th>${head}</tr></thead><tbody>${body}</tbody></table>`,
    );
  }

  function applyText(patch: Partial<SheetTextStyle> | null) {
    if (!editing || !textTarget) {
      setNotice("Select a cell, row, or column on the timetable first.");
      return;
    }
    const key = targetKey(textScope, textTarget);
    if (!key) return;
    setNotice("");
    setTimetableTextStyle(editing.id, key, patch);
  }

  function decorate(target: TextTarget) {
    return {
      className: isTextSelected(textScope, textTarget, target) ? "shadow-[inset_0_0_0_2px_var(--admin-accent)]" : "",
      style: editing ? textPaint(mergedTextStyle(editing.textStyles, target)) : undefined,
      onMouseDown: () => setTextTarget(target),
    };
  }

  const visible = timetables.filter((item) => item.id !== editingId);

  return (
    <div className="grid gap-4">
      <AdminPanel>
        <p className="mb-4 text-sm text-[var(--admin-muted)]">Choose the classes, then add the periods. Each finished timetable stays here as its own card.</p>
        {!readOnly ? (
          <AdminButton type="button" onClick={openPicker} disabled={classes.length === 0}>
            Generate time table
          </AdminButton>
        ) : null}
        {classes.length === 0 ? <p className="mt-3 text-sm text-[var(--admin-muted)]">Add a class before generating a timetable.</p> : null}
        {picking ? (
          <form
            className="mt-4 rounded-2xl bg-[var(--admin-surface-2)] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
            <p className="font-semibold">Which classes should this timetable include?</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {classes.map((item) => (
                <li key={item.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={picked.includes(item.id)}
                      onChange={(event) =>
                        setPicked((current) => (event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id)))
                      }
                    />
                    {classLabel(item)}
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <AdminButton type="submit" disabled={picked.length === 0}>
                Generate
              </AdminButton>
              <button type="button" className="rounded-xl px-4 py-2 text-sm" onClick={() => setPicking(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-[var(--admin-muted)]">{notice}</p> : null}
      </AdminPanel>

      {editing ? (
        <AdminPanel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{labelsFor(editing).join(", ") || editing.title}</h2>
              <p className="text-sm text-[var(--admin-muted)]">{editing.title}</p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--admin-accent)]"
              onClick={() => {
                setTextTarget(null);
                setEditingId(null);
              }}
            >
              Close
            </button>
          </div>
          {!readOnly ? (
            <div className="mb-4 flex flex-wrap gap-2">
              <AdminButton type="button" onClick={() => addTimetableRow(editing.id)}>
                Add row
              </AdminButton>
              <AdminButton type="button" onClick={() => addTimetableColumn(editing.id, classes[0]?.id ?? "")} disabled={classes.length === 0}>
                Add column
              </AdminButton>
              <TextTools
                styles={editing.textStyles}
                scope={textScope}
                target={textTarget}
                hint="Choose Cell, Row, or Column, then click a period, class, or subject. Bold, italic, underline, font colour, and fill apply to that selection."
                onScope={setTextScope}
                onStyle={applyText}
              />
            </div>
          ) : null}
          {editing.rows.length === 0 && editing.columns.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">This timetable has no periods or classes yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-[0.12em] text-[var(--admin-muted)] uppercase">
                    {(() => {
                      const period = decorate({ part: "label", field: "name" });
                      return (
                        <th className={`px-2 py-2 ${period.className}`} style={period.style} onMouseDown={period.onMouseDown}>
                          Period
                        </th>
                      );
                    })()}
                    {editing.columns.map((column) => {
                      const header = decorate({ part: "header", columnId: column.id });
                      return (
                        <th key={column.id} className={`min-w-52 px-2 py-2 ${header.className}`} style={header.style} onMouseDown={header.onMouseDown}>
                          <div className="grid gap-2">
                            <select
                              className={adminFieldClass}
                              style={{ ...typed, ...header.style, backgroundColor: header.style?.backgroundColor ?? undefined }}
                              value={column.classId}
                              disabled={readOnly}
                              onChange={(event) => setTimetableColumnClass(editing.id, column.id, event.target.value)}
                            >
                              {classes.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {classLabel(item)}
                                </option>
                              ))}
                            </select>
                            {!readOnly ? (
                              <button type="button" className="justify-self-start text-xs font-semibold text-[#a3361f]" onClick={() => deleteTimetableColumn(editing.id, column.id)}>
                                Delete column
                              </button>
                            ) : null}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {editing.rows.map((row) => {
                    const time = decorate({ part: "name", rowId: row.id });
                    return (
                      <tr key={row.id} className="border-t border-[var(--admin-line)]">
                        <td className={`px-2 py-2 align-top ${time.className}`} style={time.style} onMouseDown={time.onMouseDown}>
                          <input className={`${adminFieldClass} w-28`} style={{ ...typed, ...time.style }} value={row.time} disabled={readOnly} aria-label="Period time" onChange={(event) => setTimetableTime(editing.id, row.id, event.target.value)} />
                          {!readOnly ? (
                            <button type="button" className="mt-2 block text-xs font-semibold text-[#a3361f]" onClick={() => deleteTimetableRow(editing.id, row.id)}>
                              Delete row
                            </button>
                          ) : null}
                        </td>
                        {editing.columns.map((column) => {
                          const cell = editing.cells[timetableCellKey(row.id, column.id)] ?? { subject: "", teacher: "" };
                          const mark = decorate({ part: "mark", rowId: row.id, columnId: column.id });
                          const control = { ...typed, ...mark.style };
                          return (
                            <td key={column.id} className={`px-2 py-2 align-top ${mark.className}`} style={mark.style} onMouseDown={mark.onMouseDown}>
                              <div className="grid gap-2">
                                <select className={adminFieldClass} style={control} value={cell.subject} disabled={readOnly} aria-label="Subject" onChange={(event) => setTimetableCell(editing.id, row.id, column.id, { subject: event.target.value })}>
                                  <option value="">Subject</option>
                                  {subjects.map((item) => (
                                    <option key={item.id} value={item.name}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                                <select className={adminFieldClass} style={control} value={cell.teacher} disabled={readOnly} aria-label="Teacher" onChange={(event) => setTimetableCell(editing.id, row.id, column.id, { teacher: event.target.value })}>
                                  <option value="">Teacher</option>
                                  {teachers.map((item) => (
                                    <option key={item.id} value={item.name}>
                                      {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>
      ) : null}

      {visible.length === 0 && !editing ? (
        <AdminPanel>
          <p className="text-sm text-[var(--admin-muted)]">No timetable yet. Generate one to see it here.</p>
        </AdminPanel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const names = labelsFor(item);
            return (
              <article key={item.id} className="rounded-xl bg-[var(--admin-surface)] p-4 text-[var(--admin-text)] shadow-sm ring-1 ring-[var(--admin-line)]">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">Saved timetable</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{names.join(", ") || item.title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!readOnly ? (
                    <AdminButton
                      type="button"
                      onClick={() => {
                        setTextTarget(null);
                        setNotice("");
                        setEditingId(item.id);
                      }}
                    >
                      Edit
                    </AdminButton>
                  ) : null}
                  {!readOnly ? (
                    <AdminButton
                      type="button"
                      className="bg-[#a3361f]"
                      onClick={() => {
                        deleteTimetable(item.id);
                        if (editingId === item.id) setEditingId(null);
                      }}
                    >
                      Delete
                    </AdminButton>
                  ) : null}
                  <AdminButton type="button" onClick={() => downloadCsvFile(item)}>
                    Download CSV
                  </AdminButton>
                  <AdminButton type="button" onClick={() => downloadPdf(item)}>
                    Download PDF
                  </AdminButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
