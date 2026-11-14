"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AdminButton, AdminField, adminFieldClass } from "@/components/institution/shared/fields";
import { ApiError } from "@/lib/sems-api";
import { loadEmailRecipients, sendPlatformEmail, type PlatformRecipient } from "@/lib/platformadmin-api";
import { usePlatformAdminToken } from "../session";

const types = ["School", "College", "Academy"] as const;

export function PlatformEmail() {
  const token = usePlatformAdminToken();
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<PlatformRecipient[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    loadEmailRecipients(token, type)
      .then((rows) => {
        if (!active) return;
        setRecipients(rows);
        setInstitutionId((current) => (current && rows.some((item) => item.id === current) ? current : ""));
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load institutions.");
      });
    return () => {
      active = false;
    };
  }, [token, type]);

  const chosen = recipients.find((item) => item.id === institutionId);
  const audience = chosen ? chosen.name : type ? `every ${type.toLowerCase()}` : "every institution";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await sendPlatformEmail(token, { subject, type, institutionId, message });
      const missed = result.failed.length ? ` Could not reach ${result.failed.join(", ")}.` : "";
      setNotice(`Sent to ${result.sent} ${result.sent === 1 ? "institution" : "institutions"}.${missed}`);
      setSubject("");
      setMessage("");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Could not send the email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Messages</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight break-words">Sending email</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--admin-muted)]">Send one message to a single institution, or to all institutions of a chosen type.</p>
      </div>
      <form className="grid gap-3 rounded-xl bg-[var(--admin-surface)] p-4 ring-1 ring-[var(--admin-line)]" onSubmit={submit}>
        <AdminField id="email-subject" label="Subject">
          <input id="email-subject" required maxLength={160} className={adminFieldClass} value={subject} onChange={(event) => setSubject(event.target.value)} />
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField id="email-type" label="Institution type">
            <select
              id="email-type"
              className={adminFieldClass}
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setInstitutionId("");
              }}
            >
              <option value="">All types</option>
              {types.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </AdminField>
          <AdminField id="email-institution" label="Institution name">
            <select id="email-institution" className={adminFieldClass} value={institutionId} onChange={(event) => setInstitutionId(event.target.value)}>
              <option value="">All</option>
              {recipients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </AdminField>
        </div>
        <AdminField id="email-message" label="Message">
          <textarea id="email-message" required maxLength={5000} rows={10} className={`${adminFieldClass} min-h-48 resize-y`} value={message} onChange={(event) => setMessage(event.target.value)} />
        </AdminField>
        <p className="text-sm text-[var(--admin-muted)]">This message goes to {audience}.</p>
        {notice ? <p className="text-sm text-[#1f7a45]">{notice}</p> : null}
        {error ? <p className="text-sm text-[#a3361f]">{error}</p> : null}
        <div>
          <AdminButton type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send email"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
