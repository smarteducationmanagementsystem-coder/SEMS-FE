"use client";

import { Mail } from "lucide-react";
import { formatAdminDate } from "../campus-data";
import { useAdmin } from "../campus-state";
import { AdminPageIntro, AdminPanel, AdminTable, Pill } from "../shared/fields";

export function InquiriesPage() {
  const { inquiries, replyInquiry, query } = useAdmin();
  return (
    <div>
      <AdminPageIntro icon={Mail} eyebrow="Inbox" title="Inquiries" description="Student queries land here with the student name, class, subject, and message." />
      <AdminPanel>
        <AdminTable
          rows={inquiries}
          query={query}
          empty="No inquiries match this search."
          columns={[
            { key: "name", label: "Name" },
            { key: "className", label: "Class", render: (row) => row.className || "—" },
            { key: "subject", label: "Subject", render: (row) => row.subject || "—" },
            { key: "message", label: "Query" },
            { key: "date", label: "Date", render: (row) => formatAdminDate(row.date) },
            { key: "status", label: "Status", render: (row) => <Pill tone={row.status === "new" ? "info" : "good"}>{row.status === "new" ? "Not read" : "Read"}</Pill> },
            {
              key: "actions",
              label: "",
              render: (row) =>
                row.status === "new" ? (
                  <button type="button" className="text-xs font-semibold text-[var(--admin-accent)]" onClick={() => replyInquiry(row.id)}>
                    Mark as read
                  </button>
                ) : null,
            },
          ]}
        />
      </AdminPanel>
    </div>
  );
}
