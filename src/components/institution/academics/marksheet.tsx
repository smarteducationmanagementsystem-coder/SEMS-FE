"use client";

import { useState } from "react";
import type { CampusSettings } from "../campus-data";
import { useAdmin } from "../campus-state";
import { downloadA4Landscape, escapeHtml } from "../shared/paper";
import { AdminButton, AdminPanel, adminFieldClass } from "../shared/fields";

const ROWS = 25;

const sheetCss = `
@page { size: A4 landscape; margin: 6mm; }
.page { height: 198mm; display: flex; flex-direction: row; gap: 5mm; }
.msheet { flex: 1 1 0; min-width: 0; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.mname { margin: 0; text-align: center; font-size: 14px; font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.15; }
.mcity { margin: 0; text-align: center; font-size: 10px; line-height: 1.2; }
.maward { margin: 1mm 0 1.5mm; text-align: center; font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.mrow { display: flex; justify-content: space-between; align-items: flex-end; gap: 4mm; margin: 0 0 1.2mm; font-size: 11px; }
.mrow.subject { justify-content: flex-start; }
.field { display: flex; align-items: flex-end; gap: 2px; white-space: nowrap; }
.field i { display: inline-block; min-width: 28mm; border-bottom: 1px solid #111; font-style: normal; font-weight: 600; line-height: 1.1; padding: 0 1px; }
.subject .field i { min-width: 52mm; }
.mgrid { flex: 0 0 auto; }
.mtable { width: 100%; border-collapse: collapse; table-layout: fixed; }
.mtable th, .mtable td { border: 1px solid #111; text-align: center; vertical-align: middle; padding: 0 1px; background: #fff; }
.mtable th { font-size: 9px; font-weight: 700; line-height: 1.1; height: 8mm; }
.mtable tbody tr { height: 6.2mm; }
.mtable td { font-size: 10px; line-height: 1; }
.mtable td.no { font-weight: 700; }
.mfoot { display: flex; justify-content: space-between; align-items: flex-end; gap: 4mm; margin-top: auto; border: 1px solid #111; padding: 1.6mm 2mm 1.4mm; font-size: 11px; }
.mfoot i { display: inline-block; width: 32mm; border-bottom: 1px solid #111; font-style: normal; }
.mfoot .date { margin-left: auto; text-align: right; }
`;

function cityLine(settings: CampusSettings) {
  return settings.city.trim() || settings.address.trim();
}

function line(value: string) {
  return value ? escapeHtml(value) : "&nbsp;";
}

function sheetHtml(settings: CampusSettings, className: string, total: string, subject: string) {
  const city = cityLine(settings);
  const rows = Array.from({ length: ROWS }, (_, index) => {
    const left = index + 1;
    const right = left + ROWS;
    return `<tr><td class="no">${left}</td><td>&nbsp;</td><td>&nbsp;</td><td class="no">${right}</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
  }).join("");
  return `<section class="msheet">
    <div class="mname">${escapeHtml(settings.institutionName || "Academy")}</div>
    ${city ? `<div class="mcity">${escapeHtml(city)}</div>` : ""}
    <div class="maward">Award List</div>
    <div class="mrow">
      <span class="field">Class: <i>${line(className)}</i></span>
      <span class="field">Total marks: <i>${line(total)}</i></span>
    </div>
    <div class="mrow subject">
      <span class="field">Subject: <i>${line(subject)}</i></span>
    </div>
    <div class="mgrid">
      <table class="mtable">
        <colgroup>
          <col style="width:9mm"><col><col style="width:18mm">
          <col style="width:9mm"><col><col style="width:18mm">
        </colgroup>
        <thead>
          <tr>
            <th>No.</th><th>Student name</th><th>Obtained<br>marks</th>
            <th>No.</th><th>Student name</th><th>Obtained<br>marks</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="mfoot">
      <span>Teacher Signature: <i></i></span>
      <span class="date">Date: <i></i></span>
    </div>
  </section>`;
}

export function MarksheetBoard() {
  const { settings } = useAdmin();
  const [className, setClassName] = useState("");
  const [total, setTotal] = useState("");
  const [subject, setSubject] = useState("");

  function generate() {
    const one = sheetHtml(settings, className.trim(), total.trim(), subject.trim());
    downloadA4Landscape(`${settings.institutionName || "Academy"} award list`, `<div class="page">${one}${one}</div>`, sheetCss);
  }

  return (
    <AdminPanel>
      <p className="mb-4 text-sm text-[var(--admin-muted)]">Print a blank award list. One landscape A4 page holds two copies side by side. Each copy lists students 1–25 and 26–50, with class, total marks, subject, teacher signature, and date.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-[var(--admin-muted)]">
          Class
          <input className={`${adminFieldClass} mt-1`} value={className} placeholder="10th" onChange={(event) => setClassName(event.target.value)} />
        </label>
        <label className="text-xs text-[var(--admin-muted)]">
          Total marks
          <input className={`${adminFieldClass} mt-1`} value={total} placeholder="50" onChange={(event) => setTotal(event.target.value)} />
        </label>
        <label className="text-xs text-[var(--admin-muted)]">
          Subject
          <input className={`${adminFieldClass} mt-1`} value={subject} placeholder="English" onChange={(event) => setSubject(event.target.value)} />
        </label>
      </div>
      <AdminButton className="mt-4" type="button" onClick={generate}>
        Generate marks sheet
      </AdminButton>
    </AdminPanel>
  );
}
