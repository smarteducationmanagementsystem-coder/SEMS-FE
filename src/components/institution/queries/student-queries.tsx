"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { formatAdminDate } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminButton, AdminField, AdminModal, AdminPageIntro, AdminPanel, adminFieldClass, Pill } from "../shared/fields";

function readLabel(status: string) {
  return status === "new" ? "Not read" : "Read";
}

const QUERY_PAGE_SIZE = 15;

export function StudentQueriesPage() {
  const { role, inquiries, addStudentQuery, replyInquiry, portalName, portalStudentId } = useAdmin();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const canReview = role === "super_admin" || role === "institution_admin" || role === "teacher";
  const mine = inquiries.filter((item) => (item.studentId ? item.studentId === portalStudentId : item.name === portalName));
  const rows = role === "student" ? mine : inquiries.filter((item) => item.studentId);
  const pages = Math.max(1, Math.ceil(rows.length / QUERY_PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = rows.slice((safePage - 1) * QUERY_PAGE_SIZE, safePage * QUERY_PAGE_SIZE);

  if (role !== "student" && !canReview) {
    return (
      <AdminPanel>
        <h1 className="text-xl font-semibold">Student queries</h1>
        <p className="mt-2 text-sm text-[var(--admin-muted)]">Sign in as a student to send a query, or as an admin or teacher to mark one as read.</p>
      </AdminPanel>
    );
  }

  return (
    <div className="grid gap-4">
      <AdminPageIntro
        icon={MessageSquare}
        eyebrow="Inbox"
        title="Student queries"
        description={role === "student" ? "Send a subject and a message. When the institution opens it, the status here changes to Read." : "Student queries arrive here. Mark one as read and the student sees that status in the portal."}
        action={role === "student" ? <AdminButton onClick={() => setOpen(true)}>Add query</AdminButton> : null}
      />
      <AdminPanel>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--admin-muted)]">No queries yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--admin-line)]">
            {visible.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div>
                  {role !== "student" ? (
                    <p className="text-sm font-semibold">
                      {item.name}
                      {item.className ? ` · ${item.className}` : ""}
                    </p>
                  ) : null}
                  <p className="font-semibold">{item.subject}</p>
                  <p className="mt-1 text-sm">{item.message}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-muted)]">
                    <span>{formatAdminDate(item.date)}</span>
                    <Pill tone={item.status === "new" ? "info" : "good"}>{readLabel(item.status)}</Pill>
                  </p>
                </div>
                {canReview && item.status === "new" ? (
                  <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => replyInquiry(item.id)}>
                    Mark as read
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        {rows.length > 0 ? (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--admin-muted)]">
            <p>
              {rows.length} records · page {safePage} of {pages}
            </p>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg px-3 py-1.5 ring-1 ring-[var(--admin-line)] disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                Previous
              </button>
              <button type="button" className="rounded-lg px-3 py-1.5 ring-1 ring-[var(--admin-line)] disabled:opacity-40" disabled={safePage >= pages} onClick={() => setPage(safePage + 1)}>
                Next
              </button>
            </div>
          </div>
        ) : null}
      </AdminPanel>
      <AdminModal open={open} title="Add query" onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            addStudentQuery(subject, message);
            setSubject("");
            setMessage("");
            setOpen(false);
          }}
        >
          <AdminField id="query-subject" label="Subject">
            <input id="query-subject" required className={adminFieldClass} value={subject} onChange={(event) => setSubject(event.target.value)} />
          </AdminField>
          <AdminField id="query-message" label="Message">
            <textarea id="query-message" required rows={4} className={adminFieldClass} value={message} onChange={(event) => setMessage(event.target.value)} />
          </AdminField>
          <AdminButton type="submit">Send query</AdminButton>
        </form>
      </AdminModal>
    </div>
  );
}
