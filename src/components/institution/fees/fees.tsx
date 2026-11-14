"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { currentMonthValue, displayLogo, formatAdminDate, formatMoney, keptMonthRange, listedFeeStatus, type ListedFeeStatus } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, Pill, adminFieldClass } from "../shared/fields";
import { downloadA4Portrait, escapeHtml } from "../shared/paper";

type FeeSlip = {
  name: string;
  className: string;
  section: string;
  month: string;
  dated: string;
  tuition: string;
  admission: string;
  signature: string;
};

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const label = names[Number(month) - 1];
  return label && year ? `${label} ${year}` : value;
}

function slipCopy(kind: "Student copy" | "Office copy", slip: FeeSlip, institution: string, branch: string, dateLabel: string, logo: string) {
  const field = (label: string, value: string) => `<div class="row"><span class="label">${label}</span><span class="line">${escapeHtml(value)}</span></div>`;
  const mark = logo ? `<img class="logo" src="${logo}" alt="" />` : "";
  return `<div class="copy">
    <div class="head">${mark}<div class="title"><p class="academy">${escapeHtml(institution)}</p>${branch ? `<p class="branch">${escapeHtml(branch)}</p>` : ""}<p class="tag">${kind}</p></div></div>
    <div class="fields">
      ${field(dateLabel, slip.dated)}
      ${field("Name", slip.name)}
      <div class="row"><span class="label">Class</span><span class="line">${escapeHtml(slip.className)}</span><span class="label">Section</span><span class="line">${escapeHtml(slip.section)}</span></div>
      ${field("Month", slip.month)}
      ${field("Tuition Fee", slip.tuition)}
      ${field("Admission Fee", slip.admission)}
      ${field("Received by", slip.signature)}
    </div>
  </div>`;
}

function slipSheet(slips: FeeSlip[], institution: string, branch: string, dateLabel: string, logo: string) {
  const pages: FeeSlip[][] = [];
  for (let index = 0; index < slips.length; index += 4) pages.push(slips.slice(index, index + 4));
  return pages
    .map(
      (page) => `<section class="page">${page
        .map(
          (slip) => `<article class="slip">${slipCopy("Office copy", slip, institution, branch, dateLabel, logo)}<div class="cut" aria-hidden="true"><span>✂</span></div>${slipCopy("Student copy", slip, institution, branch, dateLabel, logo)}</article>`,
        )
        .join("")}</section>`,
    )
    .join("");
}

const emptySlip = (): FeeSlip => ({ name: "", className: "", section: "", month: "", dated: "", tuition: "", admission: "", signature: "" });

const feeStatusOptions: ListedFeeStatus[] = ["paid", "unpaid", "pending"];

function statusTone(status: ListedFeeStatus) {
  if (status === "paid") return "good" as const;
  if (status === "pending") return "warn" as const;
  return "bad" as const;
}

export function FeesPage() {
  const { feeStructures, fees, students, classes, role, settings, setFeeStatus } = useAdmin();
  const [slipOpen, setSlipOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterMonth, setFilterMonth] = useState(currentMonthValue());
  const [applied, setApplied] = useState<{ className: string; section: string; month: string } | null>(null);
  const [filterError, setFilterError] = useState("");
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [slipDate, setSlipDate] = useState("");
  const [slipClass, setSlipClass] = useState("");
  const [slipSection, setSlipSection] = useState("");
  const [slipMonth, setSlipMonth] = useState(currentMonthValue());
  const monthBounds = keptMonthRange();
  const [admissionFee, setAdmissionFee] = useState("");
  const [signature, setSignature] = useState("");
  const [slipError, setSlipError] = useState("");
  const slipClassNames = [...new Set(classes.map((room) => room.name))];
  const classChoices = slipClassNames.length > 0 ? slipClassNames : [...new Set(students.map((student) => student.className))];
  const sectionChoices = [
    ...new Set(
      (classes.some((room) => room.name === slipClass) ? classes.filter((room) => room.name === slipClass) : students.filter((student) => student.className === slipClass)).map((item) => item.section),
    ),
  ].filter(Boolean);
  const canCollect = role === "super_admin" || role === "institution_admin" || role === "accountant";
  const canUpdateStatus = role === "super_admin";
  const filterClassNames = [...new Set(classes.map((room) => room.name))];
  const filterClasses = filterClassNames.length > 0 ? filterClassNames : [...new Set(students.map((student) => student.className))];
  const filterSections = [
    ...new Set(
      (classes.some((room) => room.name === filterClass) ? classes.filter((room) => room.name === filterClass) : students.filter((student) => student.className === filterClass)).map((item) => item.section),
    ),
  ].filter(Boolean);
  const roster = applied
    ? students
        .filter((student) => student.status === "active" && student.className === applied.className && student.section === applied.section)
        .sort((left, right) => left.name.localeCompare(right.name))
    : [];

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={Receipt}
        eyebrow="Accounts"
        title="Fees"
        description="Print a fee slip for one class. Four students fit on each page, with a student copy and an office copy."
        action={
          canCollect ? (
            <AdminButton
              onClick={() => {
                setSlipError("");
                setSlipOpen(true);
              }}
            >
              Generate fee slip
            </AdminButton>
          ) : null
        }
      />

      {canCollect ? (
        <AdminPanel>
          <form
            className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!filterClass || !filterSection || !filterMonth) {
                setFilterError("Choose class, section, and month.");
                setApplied(null);
                return;
              }
              setFilterError("");
              setOpenStatusId(null);
              setApplied({ className: filterClass, section: filterSection, month: filterMonth });
            }}
          >
            <AdminField id="fee-class" label="Class">
              <select
                id="fee-class"
                className={adminFieldClass}
                value={filterClass}
                onChange={(event) => {
                  setFilterClass(event.target.value);
                  setFilterSection("");
                }}
              >
                <option value="">Select a class</option>
                {filterClasses.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </AdminField>
            <AdminField id="fee-section" label="Section">
              <select id="fee-section" className={adminFieldClass} value={filterSection} onChange={(event) => setFilterSection(event.target.value)}>
                <option value="">Select a section</option>
                {filterSections.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </AdminField>
            <AdminField id="fee-month" label="Month">
              <input id="fee-month" type="month" min={monthBounds.previous} max={monthBounds.current} className={adminFieldClass} value={filterMonth} onChange={(event) => setFilterMonth(event.target.value)} />
            </AdminField>
            <AdminButton type="submit">Apply filter</AdminButton>
          </form>
          {filterError ? <p className="mt-3 text-sm text-[#a3361f]">{filterError}</p> : null}
          {applied ? (
            roster.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--admin-muted)]">No students in this class and section.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="text-[11px] font-semibold tracking-[0.14em] text-[var(--admin-muted)] uppercase">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Student name</th>
                      <th className="py-2 pr-3 font-semibold">Father name</th>
                      <th className="py-2 pr-3 font-semibold">Phone no</th>
                      <th className="py-2 pr-3 font-semibold">Class</th>
                      <th className="py-2 font-semibold">Fee status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => {
                      const fee = fees.find((item) => item.studentId === student.id && item.month === applied.month);
                      const status = listedFeeStatus(fee);
                      const open = openStatusId === student.id;
                      return (
                        <tr key={student.id} className="border-t border-[var(--admin-line)]">
                          <td className="py-3 pr-3 font-medium">{student.name}</td>
                          <td className="py-3 pr-3">{student.guardian || "—"}</td>
                          <td className="py-3 pr-3">{student.guardianPhone || student.phone || "—"}</td>
                          <td className="py-3 pr-3">{student.className}</td>
                          <td className="py-3">
                            {canUpdateStatus ? (
                              <div className="relative inline-block">
                                <button type="button" className="rounded-full" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpenStatusId(open ? null : student.id)}>
                                  <Pill tone={statusTone(status)}>{status}</Pill>
                                </button>
                                {open ? (
                                  <div role="menu" className="absolute left-0 z-10 mt-1 w-32 rounded-xl bg-[var(--admin-surface)] p-1 shadow-lg ring-1 ring-[var(--admin-line)]">
                                    {feeStatusOptions.map((option) => (
                                      <button
                                        key={option}
                                        type="button"
                                        role="menuitem"
                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm capitalize hover:bg-[var(--admin-surface-2)]"
                                        onClick={() => {
                                          setFeeStatus(student.id, applied.month, option);
                                          setOpenStatusId(null);
                                        }}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <Pill tone={statusTone(status)}>{status}</Pill>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p className="mt-4 text-sm text-[var(--admin-muted)]">Choose a class, section, and month, then apply the filter.</p>
          )}
        </AdminPanel>
      ) : null}

      <AdminModal open={slipOpen} title="Generate fee slip" onClose={() => setSlipOpen(false)}>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const pickedClass = Boolean(slipClass);
            const pickedSection = Boolean(slipSection);
            if (pickedClass !== pickedSection) {
              setSlipError("Choose both class and section, or leave both empty for a blank sheet.");
              return;
            }
            const branch = [...new Set([settings.address, settings.city, settings.phone].map((item) => item.trim()).filter(Boolean))].join(" · ");
            const logo = displayLogo(settings.logoUrl);
            if (!pickedClass) {
              downloadA4Portrait(`${settings.institutionName} fee slip`, slipSheet([emptySlip(), emptySlip(), emptySlip(), emptySlip()], settings.institutionName, branch, "DATED", logo));
              setSlipOpen(false);
              setSlipError("");
              return;
            }
            const roster = students
              .filter((student) => student.status === "active" && student.className === slipClass && student.section === slipSection)
              .sort((left, right) => left.name.localeCompare(right.name));
            if (roster.length === 0) {
              setSlipError("No students in this class and section.");
              return;
            }
            const tuition = feeStructures.find((item) => item.className === slipClass)?.tuition;
            const slips = roster.map((student) => ({
              name: student.name,
              className: student.className,
              section: student.section,
              month: monthLabel(slipMonth),
              dated: slipDate ? formatAdminDate(slipDate) : "",
              tuition: typeof tuition === "number" ? formatMoney(tuition) : "",
              admission: admissionFee.trim() ? formatMoney(Number(admissionFee) || 0) : "",
              signature: signature.trim(),
            }));
            downloadA4Portrait(`${settings.institutionName} ${slipClass} fee slips`, slipSheet(slips, settings.institutionName, branch, "Due date", logo));
            setSlipOpen(false);
            setSlipError("");
          }}
        >
          <AdminField id="slip-date" label="Due date">
            <input id="slip-date" type="date" className={adminFieldClass} value={slipDate} onChange={(event) => setSlipDate(event.target.value)} />
          </AdminField>
          <AdminField id="slip-month" label="Month">
            <input id="slip-month" type="month" min={monthBounds.previous} max={monthBounds.current} className={adminFieldClass} value={slipMonth} onChange={(event) => setSlipMonth(event.target.value)} />
          </AdminField>
          <AdminField id="slip-class" label="Class">
            <select
              id="slip-class"
              className={adminFieldClass}
              value={slipClass}
              onChange={(event) => {
                setSlipClass(event.target.value);
                setSlipSection("");
              }}
            >
              <option value="">Select a class</option>
              {classChoices.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </AdminField>
          <AdminField id="slip-section" label="Section">
            <select id="slip-section" className={adminFieldClass} value={slipSection} onChange={(event) => setSlipSection(event.target.value)}>
              <option value="">Select a section</option>
              {sectionChoices.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </AdminField>
          <AdminField id="slip-admission" label="Admission fee">
            <input id="slip-admission" type="number" min={0} className={adminFieldClass} value={admissionFee} onChange={(event) => setAdmissionFee(event.target.value)} />
          </AdminField>
          <AdminField id="slip-signature" label="Signature">
            <input id="slip-signature" className={adminFieldClass} value={signature} onChange={(event) => setSignature(event.target.value)} />
          </AdminField>
          {slipError ? <p className="text-sm text-[#a3361f] sm:col-span-2">{slipError}</p> : null}
          <div className="sm:col-span-2 flex justify-end">
            <AdminButton type="submit">Generate PDF</AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
