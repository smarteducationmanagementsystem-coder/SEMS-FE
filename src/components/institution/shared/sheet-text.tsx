"use client";

import type { CSSProperties } from "react";
import type { SheetTextStyle } from "../campus-data";

export type TextScope = "cell" | "row" | "column";
export type TextPart = "title" | "no" | "name" | "mark" | "header" | "total" | "summary" | "label";

export interface TextTarget {
  part: TextPart;
  rowId?: string;
  columnId?: string;
  field?: string;
}

export function isHexColor(value: string | undefined): value is string {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
}

export function targetKey(scope: TextScope, target: TextTarget) {
  if (target.part === "title") return scope === "cell" ? "title" : "";
  if (scope === "row") return target.rowId ? `row:${target.rowId}` : "";
  if (scope === "column") {
    if (target.part === "name" || (target.part === "label" && target.field === "name")) return "column:name";
    if (target.part === "no" || (target.part === "label" && target.field === "no")) return "column:no";
    if (target.part === "summary" || (target.part === "label" && target.field && target.field !== "name" && target.field !== "no")) return target.field ? `column:${target.field}` : "";
    return target.columnId ? `column:${target.columnId}` : "";
  }
  if (target.part === "name" && target.rowId) return `name:${target.rowId}`;
  if (target.part === "no" && target.rowId) return `no:${target.rowId}`;
  if (target.part === "mark" && target.rowId && target.columnId) return `mark:${target.rowId}:${target.columnId}`;
  if (target.part === "header" && target.columnId) return `header:${target.columnId}`;
  if (target.part === "total" && target.columnId) return `total:${target.columnId}`;
  if (target.part === "summary" && target.rowId && target.field) return `summary:${target.field}:${target.rowId}`;
  if (target.part === "label" && target.field) return `label:${target.field}`;
  return "";
}

function styleLayers(target: TextTarget) {
  const keys = [];
  if (target.rowId) keys.push(`row:${target.rowId}`);
  const column = targetKey("column", target);
  if (column) keys.push(column);
  const cell = targetKey("cell", target);
  if (cell && cell !== column) keys.push(cell);
  return keys;
}

export function mergedTextStyle(styles: Record<string, SheetTextStyle> | undefined, target: TextTarget): SheetTextStyle {
  return styleLayers(target).reduce<SheetTextStyle>((result, key) => {
    const layer = styles?.[key];
    if (!layer) return result;
    return {
      bold: layer.bold === undefined ? result.bold : layer.bold,
      italic: layer.italic === undefined ? result.italic : layer.italic,
      underline: layer.underline === undefined ? result.underline : layer.underline,
      color: layer.color || result.color,
      background: layer.background || result.background,
    };
  }, {});
}

export function textStyleAttr(style: SheetTextStyle) {
  const rules = [];
  if (style.bold === true) rules.push("font-weight:700");
  if (style.bold === false) rules.push("font-weight:400");
  if (style.italic === true) rules.push("font-style:italic");
  if (style.italic === false) rules.push("font-style:normal");
  if (style.underline) rules.push("text-decoration:underline");
  if (isHexColor(style.color)) rules.push(`color:${style.color}`);
  if (isHexColor(style.background)) rules.push(`background:${style.background}`);
  return rules.length ? ` style="${rules.join(";")}"` : "";
}

export function textPaint(style: SheetTextStyle): CSSProperties {
  return {
    fontWeight: style.bold === undefined ? undefined : style.bold ? 700 : 400,
    fontStyle: style.italic === undefined ? undefined : style.italic ? "italic" : "normal",
    textDecoration: style.underline ? "underline" : undefined,
    color: isHexColor(style.color) ? style.color : undefined,
    backgroundColor: isHexColor(style.background) ? style.background : undefined,
  };
}

export function isTextSelected(scope: TextScope, selected: TextTarget | null, target: TextTarget) {
  return Boolean(selected && targetKey(scope, selected) && targetKey(scope, target) === targetKey(scope, selected) && (scope !== "row" || Boolean(target.rowId)));
}

export function TextTools({ styles, scope, target, hint, onScope, onStyle }: { styles?: Record<string, SheetTextStyle>; scope: TextScope; target: TextTarget | null; hint: string; onScope: (scope: TextScope) => void; onStyle: (patch: Partial<SheetTextStyle> | null) => void }) {
  const shown = target ? mergedTextStyle(styles, target) : {};
  function toggle(flag: "bold" | "italic" | "underline") {
    onStyle({ [flag]: !shown[flag] });
  }
  const toolClass = "rounded-lg border border-[var(--admin-line)] bg-[var(--admin-surface)] px-3 py-2 text-sm font-semibold";
  return (
    <div className="basis-full rounded-xl bg-[var(--admin-surface-2)] p-3">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">Text</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {(["cell", "row", "column"] as const).map((item) => (
          <button key={item} type="button" className={item === scope ? "rounded-lg bg-[var(--admin-accent)] px-3 py-2 text-sm font-semibold text-white capitalize" : `${toolClass} capitalize`} onClick={() => onScope(item)} aria-pressed={item === scope}>
            {item}
          </button>
        ))}
        <button type="button" className={shown.bold ? "rounded-lg bg-[var(--admin-accent)] px-3 py-2 text-sm font-bold text-white" : `${toolClass} font-bold`} aria-pressed={Boolean(shown.bold)} onClick={() => toggle("bold")}>
          B
        </button>
        <button type="button" className={shown.italic ? "rounded-lg bg-[var(--admin-accent)] px-3 py-2 text-sm italic text-white" : `${toolClass} italic`} aria-pressed={Boolean(shown.italic)} onClick={() => toggle("italic")}>
          I
        </button>
        <button type="button" className={shown.underline ? "rounded-lg bg-[var(--admin-accent)] px-3 py-2 text-sm text-white underline" : `${toolClass} underline`} aria-pressed={Boolean(shown.underline)} onClick={() => toggle("underline")}>
          U
        </button>
        <label className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          Font
          <input aria-label="Font colour" type="color" className="h-9 w-10 cursor-pointer bg-transparent" value={isHexColor(shown.color) ? shown.color : "#111827"} onChange={(event) => onStyle({ color: event.target.value })} />
        </label>
        <label className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          Fill
          <input aria-label="Fill colour" type="color" className="h-9 w-10 cursor-pointer bg-transparent" value={isHexColor(shown.background) ? shown.background : "#ffffff"} onChange={(event) => onStyle({ background: event.target.value })} />
        </label>
        <button type="button" className={toolClass} onClick={() => onStyle(null)}>
          Clear
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--admin-muted)]">{hint}</p>
    </div>
  );
}
