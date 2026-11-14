"use client";

import { useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { currentDateValue, currentMonthValue, displayLogo, keptMonthRange, type CampusSettings, type ResultColumn, type ResultRow, type ResultSheet } from "../campus-data";
import { useAdmin } from "../campus-state";
import { downloadA4Landscape, downloadCsv, escapeHtml } from "../shared/paper";
import { AdminButton, AdminPanel, adminFieldClass } from "../shared/fields";
import { TextTools, isTextSelected, mergedTextStyle, targetKey, textPaint, textStyleAttr, type TextScope, type TextTarget } from "../shared/sheet-text";

const MAX_COLUMNS = 32;
const MAX_ROWS = 200;

function localId() {
  return Math.random().toString(36).slice(2, 8);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function columnMax(column: ResultColumn) {
  return typeof column.total === "number" && Number.isFinite(column.total) ? column.total : 100;
}

function markNumber(value: string) {
  if (!value.trim()) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function rowMath(row: ResultRow, columns: ResultColumn[]) {
  const obtained = columns.reduce((sum, column) => sum + markNumber(row.marks[column.id] ?? ""), 0);
  const possible = columns.reduce((sum, column) => sum + columnMax(column), 0);
  return { obtained, possible, percent: possible === 0 ? 0 : (obtained / possible) * 100 };
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function positionsFor(rows: ResultRow[], columns: ResultColumn[]) {
  const ranked = rows
    .map((row) => ({ id: row.id, percent: Math.round(rowMath(row, columns).percent * 100) / 100 }))
    .sort((left, right) => right.percent - left.percent);
  const positions = new Map<string, number>();
  let rank = 0;
  let previous = Number.NaN;
  ranked.forEach((item, index) => {
    if (item.percent !== previous) {
      rank = index + 1;
      previous = item.percent;
    }
    positions.set(item.id, rank);
  });
  return positions;
}

function sheetWidth(value: number | undefined, fallback: number) {
  return typeof value === "number" && value > 0 ? value : fallback;
}

function fitPercents(widths: number[], floors: number[]) {
  const total = widths.reduce((sum, width) => sum + width, 0) || 1;
  let percents = widths.map((width) => (width / total) * 100);
  for (let pass = 0; pass < 8; pass += 1) {
    let deficit = 0;
    const spare = percents.map((percent, index) => {
      const room = percent - floors[index];
      if (room < 0) {
        deficit -= room;
        return 0;
      }
      return room;
    });
    const spareTotal = spare.reduce((sum, room) => sum + room, 0);
    if (deficit < 0.05 || spareTotal <= 0) break;
    const take = Math.min(deficit, spareTotal);
    percents = percents.map((percent, index) => (percent < floors[index] ? floors[index] : percent - (spare[index] / spareTotal) * take));
  }
  const sum = percents.reduce((totalPercent, percent) => totalPercent + percent, 0) || 1;
  return percents.map((percent) => (percent / sum) * 100);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.some((value) => value.trim()));
}

function blankSheet(title: string, names: string[], meta: { className: string; section: string; month: string }): ResultSheet {
  const source = names.length > 0 ? names.slice(0, MAX_ROWS) : [""];
  return {
    id: `res-${Date.now()}`,
    title,
    className: meta.className,
    section: meta.section,
    month: meta.month,
    nameWidth: 180,
    columns: [{ id: localId(), name: "Subject 1", width: 110, total: 100 }],
    rows: source.map((name) => ({ id: localId(), name, height: 40, marks: {} })),
    savedOn: "",
  };
}

function monthLabel(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${names[Number(match[2]) - 1] ?? value} ${match[1]}`;
}

function classSectionLabel(sheet: ResultSheet) {
  const label = [sheet.className, sheet.section].filter(Boolean).join(" · ");
  return label || sheet.title || "Result";
}

const skipHeader = /^(no|t\.?\s*marks|o\.?\s*marks|total|percentage|%|% ?age|position)$/i;

function sheetFromCsv(text: string, previous?: ResultSheet) {
  const table = parseCsv(text);
  const header = (table[0] ?? []).map((cell) => cell.trim());
  let nameIndex = header.findIndex((cell) => /student|name/i.test(cell));
  if (nameIndex < 0) nameIndex = /^no$/i.test(header[0] ?? "") ? 1 : 0;
  const subjectIndexes = header.map((cell, index) => ({ cell, index })).filter((item) => item.index > nameIndex && item.cell && !skipHeader.test(item.cell)).map((item) => item.index);
  const usedIndexes = (subjectIndexes.length > 0 ? subjectIndexes : [nameIndex + 1]).slice(0, MAX_COLUMNS);
  const second = table[1] ?? [];
  const totalsRow = usedIndexes.length > 0 && !(second[nameIndex] ?? "").trim() && usedIndexes.every((index) => !(second[index] ?? "").trim() || Number.isFinite(Number(second[index]))) && usedIndexes.some((index) => (second[index] ?? "").trim());
  const columns = usedIndexes.map((index) => ({
    id: localId(),
    name: header[index] || `Subject ${index}`,
    width: 110,
    total: totalsRow && (second[index] ?? "").trim() ? Number(second[index]) : 100,
  }));
  const body = table.slice(totalsRow ? 2 : 1).slice(0, MAX_ROWS);
  const source = body.length > 0 ? body : [[""]];
  const rows = source.map((cells) => {
    const marks: Record<string, string> = {};
    columns.forEach((column, columnIndex) => {
      const value = cells[usedIndexes[columnIndex]]?.trim() ?? "";
      if (value) marks[column.id] = value;
    });
    return { id: localId(), name: cells[nameIndex]?.trim() ?? "", height: 40, marks };
  });
  return {
    sheet: {
      id: previous?.id ?? `res-${Date.now()}`,
      title: previous?.title || "Imported result",
      className: previous?.className ?? "",
      section: previous?.section ?? "",
      month: previous?.month ?? "",
      nameWidth: previous?.nameWidth ?? 180,
      textStyles: previous?.textStyles,
      columns,
      rows,
      savedOn: previous?.savedOn ?? "",
    } satisfies ResultSheet,
    truncated: subjectIndexes.length > MAX_COLUMNS || table.slice(totalsRow ? 2 : 1).length > MAX_ROWS,
  };
}

function sheetRows(sheet: ResultSheet) {
  const positions = positionsFor(sheet.rows, sheet.columns);
  const possible = sheet.columns.reduce((sum, column) => sum + columnMax(column), 0);
  const header = ["No", "Student", ...sheet.columns.map((column) => column.name), "T. Marks", "O. Marks", "% Age", "Position"];
  const totals = ["", "", ...sheet.columns.map((column) => String(columnMax(column))), String(possible), "", "", ""];
  const body = sheet.rows.map((row, index) => {
    const math = rowMath(row, sheet.columns);
    return [String(index + 1), row.name, ...sheet.columns.map((column) => row.marks[column.id] ?? ""), String(math.possible), String(math.obtained), formatPercent(math.percent), String(positions.get(row.id) ?? "")];
  });
  return [header, totals, ...body];
}

function fileName(title: string) {
  const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "result"}.csv`;
}

function dragSize(event: ReactPointerEvent<HTMLElement>, start: number, onSize: (value: number) => void, axis: "x" | "y") {
  event.preventDefault();
  event.stopPropagation();
  const handle = event.currentTarget;
  const pointerId = event.pointerId;
  const origin = axis === "x" ? event.clientX : event.clientY;
  handle.setPointerCapture(pointerId);
  const move = (pointer: PointerEvent) => {
    const next = axis === "x" ? start + pointer.clientX - origin : start + pointer.clientY - origin;
    onSize(axis === "x" ? clamp(next, 72, 360) : clamp(next, 32, 140));
  };
  const stop = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", stop);
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", stop);
}

function ResultGrid({ sheet, editing, onChange, settings, textScope = "cell", textTarget = null, onPickTarget }: { sheet: ResultSheet; editing: boolean; onChange?: (sheet: ResultSheet) => void; settings: CampusSettings; textScope?: TextScope; textTarget?: TextTarget | null; onPickTarget?: (target: TextTarget) => void }) {
  function patch(recipe: (current: ResultSheet) => ResultSheet) {
    onChange?.(recipe(sheet));
  }
  function decorate(target: TextTarget) {
    const hot = isTextSelected(textScope, textTarget, target);
    return {
      className: hot ? "shadow-[inset_0_0_0_2px_var(--admin-accent)]" : "",
      style: textPaint(mergedTextStyle(sheet.textStyles, target)),
      onMouseDown: () => onPickTarget?.(target),
    };
  }
  const typed: CSSProperties = { color: "inherit", fontWeight: "inherit", fontStyle: "inherit", textDecoration: "inherit", backgroundColor: "transparent" };
  const positions = positionsFor(sheet.rows, sheet.columns);
  const possible = sheet.columns.reduce((sum, column) => sum + columnMax(column), 0);
  const logo = displayLogo(settings.logoUrl);
  const noWidth = sheetWidth(sheet.noWidth, 52);
  const marksWidth = sheetWidth(sheet.marksWidth, 84);
  const obtainedWidth = sheetWidth(sheet.obtainedWidth, 84);
  const percentWidth = sheetWidth(sheet.percentWidth, 72);
  const positionWidth = sheetWidth(sheet.positionWidth, 84);
  const subjectRowHeight = sheetWidth(sheet.subjectRowHeight, 52);
  const labelRowHeight = sheetWidth(sheet.labelRowHeight, 40);
  const leadWidth = noWidth + sheet.nameWidth;

  return (
    <div>
      <div className="mb-2 flex items-end gap-4">
        <div className="flex shrink-0 justify-center" style={{ width: leadWidth }}>
          <span
            className="size-20 rounded-full border border-[var(--admin-line)] bg-[var(--admin-surface)] bg-cover bg-center"
            style={logo ? { backgroundImage: `url("${logo}")` } : undefined}
            role="img"
            aria-label={logo ? `${settings.institutionName} logo` : "Institution logo"}
          />
        </div>
        <div className="min-w-0 flex-1 pb-1 text-center">
          <p className="text-2xl font-extrabold tracking-wide uppercase">{settings.institutionName}</p>
          {settings.address.trim() || settings.city.trim() ? <p className="mt-1 text-[11px] leading-snug">{settings.address.trim() || settings.city.trim()}</p> : null}
          {settings.phone.trim() ? <p className="text-[11px] leading-snug">{settings.phone.trim()}</p> : null}
        </div>
        {sheet.title ? (
          <div className={`mb-1 max-w-40 border border-[var(--admin-text)] px-3 py-2 text-center text-sm font-bold tracking-wide uppercase ${decorate({ part: "title" }).className}`} style={decorate({ part: "title" }).style} onMouseDown={() => onPickTarget?.({ part: "title" })}>
            {sheet.title}
          </div>
        ) : null}
      </div>
      <div className="overflow-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr style={{ height: subjectRowHeight }}>
              <th className="relative border border-[var(--admin-line)] bg-[var(--admin-surface-2)]" style={{ width: noWidth, minWidth: noWidth }}>
                {editing ? <span role="separator" aria-orientation="vertical" title="Drag to resize" className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, noWidth, (next) => patch((current) => ({ ...current, noWidth: next })), "x")} /> : null}
                {editing ? <span role="separator" aria-orientation="horizontal" title="Drag to resize" className="absolute bottom-0 left-0 z-10 h-2 w-full cursor-row-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, subjectRowHeight, (next) => patch((current) => ({ ...current, subjectRowHeight: next })), "y")} /> : null}
              </th>
              <th className="relative border border-[var(--admin-line)] bg-[var(--admin-surface-2)]" style={{ width: sheet.nameWidth, minWidth: sheet.nameWidth }}>
                {editing ? <span role="separator" aria-orientation="vertical" title="Drag to resize" className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, sheet.nameWidth, (nameWidth) => patch((current) => ({ ...current, nameWidth })), "x")} /> : null}
              </th>
              {sheet.columns.map((column) => {
                const header = decorate({ part: "header", columnId: column.id });
                return (
                <th key={column.id} className={`relative border border-[var(--admin-line)] bg-[var(--admin-surface-2)] p-0 text-center align-middle font-bold ${header.className}`} style={{ width: column.width, minWidth: column.width, ...header.style }} onMouseDown={header.onMouseDown}>
                  <div className="flex items-center justify-center gap-1 px-1">
                    {editing ? (
                      <input aria-label="Subject name" className="w-full bg-transparent px-1 py-2 text-center uppercase outline-none" style={typed} value={column.name} onChange={(event) => patch((current) => ({ ...current, columns: current.columns.map((item) => (item.id === column.id ? { ...item, name: event.target.value } : item)) }))} />
                    ) : (
                      <span className="px-1 py-2 font-bold uppercase">{column.name}</span>
                    )}
                    {editing && sheet.columns.length > 1 ? (
                      <button type="button" className="px-1 text-xs text-[#a3361f]" aria-label={`Remove ${column.name}`} onClick={() => patch((current) => ({ ...current, columns: current.columns.filter((item) => item.id !== column.id) }))}>
                        ×
                      </button>
                    ) : null}
                  </div>
                  {editing ? <span role="separator" aria-orientation="vertical" title="Drag to resize" className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, column.width, (width) => patch((current) => ({ ...current, columns: current.columns.map((item) => (item.id === column.id ? { ...item, width } : item)) })), "x")} /> : null}
                </th>
                );
              })}
              {(
                [
                  ["T. Marks", marksWidth, "marksWidth"],
                  ["O. Marks", obtainedWidth, "obtainedWidth"],
                  ["% Age", percentWidth, "percentWidth"],
                  ["Position", positionWidth, "positionWidth"],
                ] as const
              ).map(([label, width, key]) => {
                const summary = decorate({ part: "label", field: key === "marksWidth" ? "possible" : key === "obtainedWidth" ? "obtained" : key === "percentWidth" ? "percent" : "position" });
                return (
                <th key={label} className={`relative border border-[var(--admin-line)] bg-[var(--admin-surface-2)] px-1 text-center text-xs font-bold uppercase ${summary.className}`} style={{ width, minWidth: width, ...summary.style }} onMouseDown={summary.onMouseDown}>
                  {label}
                  {editing ? <span role="separator" aria-orientation="vertical" title="Drag to resize" className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, width, (next) => patch((current) => ({ ...current, [key]: next })), "x")} /> : null}
                </th>
                );
              })}
            </tr>
            <tr style={{ height: labelRowHeight }}>
              {(() => {
                const noLabel = decorate({ part: "label", field: "no" });
                return (
                  <th className={`relative border border-[var(--admin-line)] px-1 text-center text-xs font-bold ${noLabel.className}`} style={{ width: noWidth, ...noLabel.style }} onMouseDown={noLabel.onMouseDown}>
                    No
                    {editing ? <span role="separator" aria-orientation="horizontal" title="Drag to resize" className="absolute bottom-0 left-0 z-10 h-2 w-full cursor-row-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, labelRowHeight, (next) => patch((current) => ({ ...current, labelRowHeight: next })), "y")} /> : null}
                  </th>
                );
              })()}
              {(() => {
                const nameLabel = decorate({ part: "label", field: "name" });
                return (
                  <th className={`border border-[var(--admin-line)] px-2 text-left text-xs font-bold ${nameLabel.className}`} style={{ width: sheet.nameWidth, ...nameLabel.style }} onMouseDown={nameLabel.onMouseDown}>
                    Students Name
                  </th>
                );
              })()}
              {sheet.columns.map((column) => {
                const total = decorate({ part: "total", columnId: column.id });
                return (
                  <th key={`${column.id}-total`} className={`border border-[var(--admin-line)] p-0 text-center font-semibold ${total.className}`} style={total.style} onMouseDown={total.onMouseDown}>
                    {editing ? (
                      <input
                        aria-label={`${column.name} total marks`}
                        type="number"
                        min={0}
                        className="w-full bg-transparent px-1 py-1 text-center outline-none"
                        style={typed}
                        value={columnMax(column)}
                        onChange={(event) => patch((current) => ({ ...current, columns: current.columns.map((item) => (item.id === column.id ? { ...item, total: Number(event.target.value) || 0 } : item)) }))}
                      />
                    ) : (
                      columnMax(column)
                    )}
                  </th>
                );
              })}
              <th className="border border-[var(--admin-line)] px-1 text-center font-semibold">{possible}</th>
              <th className="border border-[var(--admin-line)]" />
              <th className="border border-[var(--admin-line)]" />
              <th className="border border-[var(--admin-line)]" />
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, index) => {
              const math = rowMath(row, sheet.columns);
              const noCell = decorate({ part: "no", rowId: row.id });
              const nameCell = decorate({ part: "name", rowId: row.id });
              const summaryCell = (field: string) => decorate({ part: "summary", rowId: row.id, field });
              const possibleCell = summaryCell("possible");
              const obtainedCell = summaryCell("obtained");
              const percentCell = summaryCell("percent");
              const positionCell = summaryCell("position");
              return (
                <tr key={row.id}>
                  <td className={`border border-[var(--admin-line)] px-2 ${noCell.className}`} style={noCell.style} onMouseDown={noCell.onMouseDown}>{index + 1}</td>
                  <td className={`relative border border-[var(--admin-line)] p-0 ${nameCell.className}`} style={{ height: row.height, ...nameCell.style }} onMouseDown={nameCell.onMouseDown}>
                    <div className="flex h-full items-center">
                      {editing ? (
                        <input aria-label="Student name" className="h-full w-full bg-transparent px-2 outline-none" style={typed} value={row.name} onChange={(event) => patch((current) => ({ ...current, rows: current.rows.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)) }))} />
                      ) : (
                        <span className="px-2 font-medium">{row.name}</span>
                      )}
                      {editing && sheet.rows.length > 1 ? (
                        <button type="button" className="px-2 text-xs text-[#a3361f]" aria-label={`Remove ${row.name || "row"}`} onClick={() => patch((current) => ({ ...current, rows: current.rows.filter((item) => item.id !== row.id) }))}>
                          ×
                        </button>
                      ) : null}
                    </div>
                    {editing ? <span role="separator" aria-orientation="horizontal" aria-label={`Resize ${row.name || "row"}`} title="Drag to resize" className="absolute bottom-0 left-0 z-10 h-2 w-full cursor-row-resize bg-[var(--admin-line)]" onPointerDown={(event) => dragSize(event, row.height, (height) => patch((current) => ({ ...current, rows: current.rows.map((item) => (item.id === row.id ? { ...item, height } : item)) })), "y")} /> : null}
                  </td>
                  {sheet.columns.map((column) => {
                    const mark = decorate({ part: "mark", rowId: row.id, columnId: column.id });
                    return (
                      <td key={column.id} className={`border border-[var(--admin-line)] p-0 ${mark.className}`} style={mark.style} onMouseDown={mark.onMouseDown}>
                        {editing ? (
                          <input
                            aria-label={`${row.name || "Student"} ${column.name}`}
                            className="h-full w-full bg-transparent px-2 outline-none"
                            style={typed}
                            value={row.marks[column.id] ?? ""}
                            onChange={(event) =>
                              patch((current) => ({
                                ...current,
                                rows: current.rows.map((item) => (item.id === row.id ? { ...item, marks: { ...item.marks, [column.id]: event.target.value } } : item)),
                              }))
                            }
                          />
                        ) : (
                          <span className="px-2">{row.marks[column.id] || "—"}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`border border-[var(--admin-line)] px-2 font-semibold ${possibleCell.className}`} style={possibleCell.style} onMouseDown={possibleCell.onMouseDown}>{math.possible}</td>
                  <td className={`border border-[var(--admin-line)] px-2 font-semibold ${obtainedCell.className}`} style={obtainedCell.style} onMouseDown={obtainedCell.onMouseDown}>{math.obtained}</td>
                  <td className={`border border-[var(--admin-line)] px-2 font-semibold text-[#1b7f3a] ${percentCell.className}`} style={percentCell.style} onMouseDown={percentCell.onMouseDown}>{formatPercent(math.percent)}</td>
                  <td className={`border border-[var(--admin-line)] px-2 ${positionCell.className}`} style={positionCell.style} onMouseDown={positionCell.onMouseDown}>{positions.get(row.id)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultBoard() {
  const { classes, students, resultSheets, saveResultSheet, deleteResultSheet, settings } = useAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<ResultSheet | null>(null);
  const [setup, setSetup] = useState(false);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(currentMonthValue());
  const monthBounds = keptMonthRange();
  const [notice, setNotice] = useState("");
  const [textScope, setTextScope] = useState<TextScope>("cell");
  const [textTarget, setTextTarget] = useState<TextTarget | null>(null);
  const classNames = [...new Set(classes.map((room) => room.name))];
  const sections = [...new Set(classes.filter((room) => room.name === className).map((room) => room.section))];

  function startSheet() {
    const names = students
      .filter((student) => student.status === "active" && student.className === className && (!section || student.section === section))
      .map((student) => student.name)
      .sort((left, right) => left.localeCompare(right));
    setTextTarget(null);
    setDraft(blankSheet(title.trim() || "Result", names, { className, section, month }));
    setNotice(names.length > MAX_ROWS ? "The first 200 students were added." : "Write each subject’s total marks under its name. Obtained marks, percentage, and position fill in on their own.");
    setSetup(false);
  }

  function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const loaded = sheetFromCsv(text, draft ?? undefined);
      setTextTarget(null);
      setDraft(loaded.sheet);
      setSetup(false);
      setNotice(loaded.truncated ? `Only the first ${MAX_ROWS} rows and ${MAX_COLUMNS} subject columns were imported. Edit the sheet, then save.` : "CSV imported. You can edit every cell, then save.");
    };
    reader.readAsText(file);
  }

  function downloadPdf(sheet: ResultSheet) {
    const positions = positionsFor(sheet.rows, sheet.columns);
    const possible = sheet.columns.reduce((sum, column) => sum + columnMax(column), 0);
    const logo = displayLogo(settings.logoUrl);
    const noWidth = sheetWidth(sheet.noWidth, 52);
    const marksWidth = sheetWidth(sheet.marksWidth, 84);
    const obtainedWidth = sheetWidth(sheet.obtainedWidth, 84);
    const percentWidth = sheetWidth(sheet.percentWidth, 72);
    const positionWidth = sheetWidth(sheet.positionWidth, 84);
    const subjectRowHeight = sheetWidth(sheet.subjectRowHeight, 52);
    const labelRowHeight = sheetWidth(sheet.labelRowHeight, 40);
    const widths = [noWidth, sheet.nameWidth, ...sheet.columns.map((column) => column.width), marksWidth, obtainedWidth, percentWidth, positionWidth];
    const floors = [2.6, 7.2, ...sheet.columns.map(() => 0), 4.2, 4.2, 3.4, 5.2];
    const percents = fitPercents(widths, floors);
    const columns = percents.map((percent) => `<col style="width:${percent.toFixed(3)}%">`).join("");
    const paint = (target: TextTarget) => textStyleAttr(mergedTextStyle(sheet.textStyles, target));
    const subjects = sheet.columns.map((column) => `<th class="subject"${paint({ part: "header", columnId: column.id })}>${escapeHtml(column.name)}</th>`).join("");
    const totals = sheet.columns.map((column) => `<th${paint({ part: "total", columnId: column.id })}>${columnMax(column)}</th>`).join("");
    const body = sheet.rows
      .map((row, index) => {
        const math = rowMath(row, sheet.columns);
        const marks = sheet.columns.map((column) => `<td${paint({ part: "mark", rowId: row.id, columnId: column.id })}>${escapeHtml(row.marks[column.id] || "—")}</td>`).join("");
        return `<tr style="height:${row.height}px"><td${paint({ part: "no", rowId: row.id })}>${index + 1}</td><td class="name"${paint({ part: "name", rowId: row.id })}>${escapeHtml(row.name)}</td>${marks}<td${paint({ part: "summary", rowId: row.id, field: "possible" })}>${math.possible}</td><td${paint({ part: "summary", rowId: row.id, field: "obtained" })}>${math.obtained}</td><td class="pct"${paint({ part: "summary", rowId: row.id, field: "percent" })}>${formatPercent(math.percent)}</td><td${paint({ part: "summary", rowId: row.id, field: "position" })}>${positions.get(row.id) ?? ""}</td></tr>`;
      })
      .join("");
    const banner = `<div class="banner"><div class="logo">${logo ? `<img src="${logo}" alt="" />` : ""}</div><div class="academy"><div class="academy-name">${escapeHtml(settings.institutionName)}</div>${settings.address.trim() || settings.city.trim() ? `<div>${escapeHtml(settings.address.trim() || settings.city.trim())}</div>` : ""}${settings.phone.trim() ? `<div>${escapeHtml(settings.phone.trim())}</div>` : ""}</div>${sheet.title ? `<div class="report"${paint({ part: "title" })}>${escapeHtml(sheet.title)}</div>` : ""}</div>`;
    const table = `<table class="result"><colgroup>${columns}</colgroup><thead><tr class="subjects" style="height:${subjectRowHeight}px"><th></th><th></th>${subjects}<th class="fit"${paint({ part: "label", field: "possible" })}>T. MARKS</th><th class="fit"${paint({ part: "label", field: "obtained" })}>O. MARKS</th><th class="fit"${paint({ part: "label", field: "percent" })}>% AGE</th><th class="fit"${paint({ part: "label", field: "position" })}>POSITION</th></tr><tr class="labels" style="height:${labelRowHeight}px"><th${paint({ part: "label", field: "no" })}>No</th><th class="name"${paint({ part: "label", field: "name" })}>Students Name</th>${totals}<th>${possible}</th><th></th><th></th><th></th></tr></thead><tbody>${body}</tbody></table>`;
    const fontSize = Math.max(6, Math.min(9, Math.round(220 / (sheet.columns.length + 6))));
    downloadA4Landscape(
      sheet.title || "Result",
      `${banner}${table}`,
      `html, body { margin: 0; padding: 0; width: 100%; }
      .banner { display: flex; align-items: flex-end; gap: 8px; margin: 0 0 4px; width: 100%; }
      .logo { width: 14mm; flex: 0 0 auto; text-align: center; }
      .logo img { width: 12mm; height: 12mm; object-fit: cover; border-radius: 50%; }
      .academy { flex: 1; min-width: 0; text-align: center; font-size: 9px; line-height: 1.25; }
      .academy-name { font-size: 15px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; line-height: 1.15; }
      .report { max-width: 42mm; flex: 0 0 auto; border: 1px solid #111; padding: 3px 5px; font-size: 8px; font-weight: 700; line-height: 1.2; text-align: center; text-transform: uppercase; }
      table.result { width: 100%; table-layout: fixed; border-collapse: collapse; }
      table.result th, table.result td { border: 1px solid #111; padding: 0; width: 0; font-size: ${fontSize}px; line-height: 1.05; text-align: center; vertical-align: middle; font-weight: 700; word-break: normal; overflow-wrap: normal; overflow: hidden; background: #fff; }
      table.result .subjects th { text-transform: uppercase; background: #f4f6fb; }
      table.result .subject { font-size: ${Math.max(5, fontSize - 1)}px; }
      table.result .fit { font-size: ${fontSize}px; white-space: nowrap; letter-spacing: 0; padding: 0 1px; }
      table.result .name { text-align: left; padding-left: 2px; font-weight: 600; text-transform: none; white-space: normal; }
      table.result .pct { color: #1b7f3a; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }`,
      "3mm 1.5mm",
    );
  }

  return (
    <div className="grid gap-4">
      <AdminPanel>
        <p className="mb-4 text-sm text-[var(--admin-muted)]">The sheet shows the academy name, address, and phone. Drag a column or row edge to resize it. Add up to {MAX_COLUMNS} subject columns and {MAX_ROWS} rows.</p>
        <div className="flex flex-wrap gap-2">
          <AdminButton type="button" onClick={() => setSetup(true)}>
            Generate result
          </AdminButton>
          <AdminButton type="button" onClick={() => fileRef.current?.click()}>
            Import CSV
          </AdminButton>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={importCsv} />
        </div>
        {setup ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-[var(--admin-muted)] sm:col-span-2">
              Report name
              <input className={`${adminFieldClass} mt-1`} value={title} placeholder="10th first round result" onChange={(event) => setTitle(event.target.value)} />
            </label>
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
                <option value="">All classes, blank rows</option>
                {classNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--admin-muted)]">
              Section
              <select className={`${adminFieldClass} mt-1`} value={section} onChange={(event) => setSection(event.target.value)}>
                <option value="">All sections</option>
                {sections.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="text-xs text-[var(--admin-muted)]">
              Month
              <input type="month" min={monthBounds.previous} max={monthBounds.current} className={`${adminFieldClass} mt-1`} value={month} onChange={(event) => setMonth(event.target.value)} />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <AdminButton type="button" onClick={startSheet}>
                Start sheet
              </AdminButton>
              <button type="button" className="rounded-xl px-4 py-2 text-sm" onClick={() => setSetup(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-[var(--admin-muted)]">{notice}</p> : null}
        {draft ? (
          <div className="mt-4 grid gap-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-[var(--admin-muted)]">
                Report name
                <input className={`${adminFieldClass} mt-1`} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Class
                <input className={`${adminFieldClass} mt-1`} value={draft.className ?? ""} onChange={(event) => setDraft({ ...draft, className: event.target.value })} />
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Section
                <input className={`${adminFieldClass} mt-1`} value={draft.section ?? ""} onChange={(event) => setDraft({ ...draft, section: event.target.value })} />
              </label>
              <label className="text-xs text-[var(--admin-muted)]">
                Month
                <input type="month" min={monthBounds.previous} max={monthBounds.current} className={`${adminFieldClass} mt-1`} value={draft.month ?? ""} onChange={(event) => setDraft({ ...draft, month: event.target.value })} />
              </label>
              <AdminButton type="button" disabled={draft.rows.length >= MAX_ROWS} onClick={() => setDraft({ ...draft, rows: [...draft.rows, { id: localId(), name: "", height: 40, marks: {} }] })}>
                Add row ({draft.rows.length}/{MAX_ROWS})
              </AdminButton>
              <AdminButton type="button" disabled={draft.rows.length <= 1} onClick={() => setDraft({ ...draft, rows: draft.rows.slice(0, -1) })}>
                Remove row
              </AdminButton>
              <AdminButton type="button" disabled={draft.columns.length >= MAX_COLUMNS} onClick={() => setDraft({ ...draft, columns: [...draft.columns, { id: localId(), name: `Subject ${draft.columns.length + 1}`, width: 110, total: 100 }] })}>
                Add column ({draft.columns.length}/{MAX_COLUMNS})
              </AdminButton>
              <AdminButton type="button" disabled={draft.columns.length <= 1} onClick={() => setDraft({ ...draft, columns: draft.columns.slice(0, -1) })}>
                Remove column
              </AdminButton>
              <AdminButton type="button" onClick={() => setDraft({ ...draft, rows: draft.rows.map((row) => ({ ...row, marks: {} })) })}>
                Clear marks
              </AdminButton>
              <TextTools
                styles={draft.textStyles}
                scope={textScope}
                target={textTarget}
                hint="Choose Cell, Row, or Column, then click a subject, student name, or mark. Bold, italic, underline, font colour, and fill apply to that selection."
                onScope={setTextScope}
                onStyle={(patch) => {
                  if (!textTarget) {
                    setNotice("Select a cell, row, or column on the sheet first.");
                    return;
                  }
                  const key = targetKey(textScope, textTarget);
                  if (!key) return;
                  setDraft((current) => {
                    if (!current) return current;
                    const textStyles = { ...(current.textStyles ?? {}) };
                    if (!patch) delete textStyles[key];
                    else textStyles[key] = { ...textStyles[key], ...patch };
                    return { ...current, textStyles };
                  });
                }}
              />
              <AdminButton
                type="button"
                onClick={() => {
                  saveResultSheet({ ...draft, title: draft.title.trim() || "Result", savedOn: currentDateValue() });
                  setTextTarget(null);
                  setDraft(null);
                  setNotice("");
                }}
              >
                Save
              </AdminButton>
              <button type="button" className="rounded-xl px-4 py-2 text-sm" onClick={() => { setTextTarget(null); setDraft(null); }}>
                Close
              </button>
            </div>
            <ResultGrid sheet={draft} editing onChange={setDraft} settings={settings} textScope={textScope} textTarget={textTarget} onPickTarget={setTextTarget} />
          </div>
        ) : null}
      </AdminPanel>
      {resultSheets.filter((sheet) => sheet.id !== draft?.id).length === 0 ? (
        draft ? null : (
          <AdminPanel>
            <p className="text-sm text-[var(--admin-muted)]">No result sheet yet. Generate one and it stays on this page.</p>
          </AdminPanel>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {resultSheets
            .filter((sheet) => sheet.id !== draft?.id)
            .map((sheet) => (
              <article key={sheet.id} className="rounded-xl bg-[var(--admin-surface)] p-4 text-[var(--admin-text)] shadow-sm ring-1 ring-[var(--admin-line)]">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">Saved result</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{classSectionLabel(sheet)}</h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">{sheet.month ? monthLabel(sheet.month) : "Month not set"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminButton
                    type="button"
                    onClick={() => {
                      setTextTarget(null);
                      setDraft({
                        ...sheet,
                        columns: sheet.columns.map((column) => ({ ...column, total: columnMax(column) })),
                        rows: sheet.rows.map((row) => ({ ...row, marks: { ...row.marks } })),
                      });
                      setNotice("The saved marks and subjects stay while you edit. Clear marks removes only the numbers.");
                    }}
                  >
                    Edit
                  </AdminButton>
                  <AdminButton type="button" className="bg-[#a3361f]" onClick={() => deleteResultSheet(sheet.id)}>
                    Delete
                  </AdminButton>
                  <AdminButton type="button" onClick={() => downloadCsv(fileName(sheet.title), sheetRows(sheet))}>
                    Download CSV
                  </AdminButton>
                  <AdminButton type="button" onClick={() => downloadPdf(sheet)}>
                    Download PDF
                  </AdminButton>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
