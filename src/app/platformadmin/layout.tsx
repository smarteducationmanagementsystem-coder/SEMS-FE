import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PlatformShell } from "./shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const instant = false;

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
