import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/institution/shell/campus-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Session lives in the client shell, so the dashboard segment is not in the logged-out shell. */
export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
