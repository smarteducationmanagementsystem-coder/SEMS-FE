import {
  Award,
  BookOpen,
  Briefcase,
  CalendarCheck,
  Clock,
  ClipboardCheck,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Settings,
  Shield,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/constants/routes";
import type { RoleId } from "./campus-data";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: RoleId[];
}

const allRoles: RoleId[] = ["super_admin", "institution_admin", "teacher", "accountant", "student", "parent"];

/** Sidebar entries. Order here is the order shown in the admin frame. */
export const adminNav: AdminNavItem[] = [
  { href: routes.admin, label: "Dashboard", icon: LayoutDashboard, roles: allRoles },
  { href: `${routes.admin}/students`, label: "Students", icon: GraduationCap, roles: ["super_admin", "institution_admin", "teacher", "student", "parent"] },
  { href: `${routes.admin}/teachers`, label: "Teachers", icon: Users, roles: ["super_admin", "institution_admin"] },
  { href: `${routes.admin}/staff`, label: "Staff", icon: Briefcase, roles: ["super_admin", "institution_admin"] },
  { href: `${routes.admin}/hiring`, label: "Hiring staff", icon: UserPlus, roles: ["super_admin", "institution_admin"] },
  { href: `${routes.admin}/attendance`, label: "Student attendance", icon: ClipboardCheck, roles: ["super_admin", "institution_admin", "teacher", "student", "parent"] },
  { href: `${routes.admin}/teacher-attendance`, label: "Staff attendance", icon: Clock, roles: ["super_admin", "institution_admin", "teacher"] },
  { href: `${routes.admin}/staff-attendance`, label: "View staff attendance", icon: CalendarCheck, roles: ["super_admin", "institution_admin"] },
  { href: `${routes.admin}/fees`, label: "Fees", icon: Receipt, roles: ["super_admin", "institution_admin", "accountant", "student", "parent"] },
  { href: `${routes.admin}/exams`, label: "Examinations", icon: BookOpen, roles: ["super_admin", "institution_admin", "teacher"] },
  { href: `${routes.admin}/results`, label: "Results", icon: Award, roles: ["super_admin", "institution_admin", "teacher", "student", "parent"] },
  { href: `${routes.admin}/academics`, label: "Academics", icon: UserRound, roles: ["super_admin", "institution_admin", "teacher"] },
  { href: `${routes.admin}/roles`, label: "Roles", icon: Shield, roles: ["super_admin", "institution_admin"] },
  { href: `${routes.admin}/permissions`, label: "Permissions", icon: KeyRound, roles: ["super_admin"] },
  { href: `${routes.admin}/queries`, label: "Student queries", icon: MessageSquare, roles: ["super_admin", "institution_admin", "teacher", "student"] },
  { href: `${routes.admin}/settings`, label: "Settings", icon: Settings, roles: ["super_admin", "institution_admin"] },
];

export interface PortalAccess {
  teacher: string[];
  staff: string[];
  student: string[];
}

/** Pages the institution super user can grant. Permissions itself stays with the owner. */
export function grantablePages() {
  return adminNav.filter((item) => item.href !== `${routes.admin}/permissions`);
}

export function defaultPortalAccess(): PortalAccess {
  return {
    teacher: adminNav.filter((item) => item.roles.includes("teacher")).map((item) => item.href),
    staff: [routes.admin, `${routes.admin}/teacher-attendance`, `${routes.admin}/results`],
    student: adminNav.filter((item) => item.roles.includes("student")).map((item) => item.href),
  };
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === routes.admin) return pathname === routes.admin;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function navForRole(role: RoleId, access?: PortalAccess, portal?: "teacher" | "staff" | "student") {
  const key = portal === "staff" ? "staff" : role === "teacher" || role === "student" ? role : null;
  if (access && key) {
    const allowed = new Set(access[key]);
    return adminNav.filter((item) => allowed.has(item.href));
  }
  return adminNav.filter((item) => item.roles.includes(role));
}

export function canAccessPath(pathname: string, role: RoleId, access?: PortalAccess, portal?: "teacher" | "staff" | "student") {
  return navForRole(role, access, portal).some((item) => isAdminNavActive(pathname, item.href));
}
