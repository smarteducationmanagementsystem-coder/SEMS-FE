"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode, type SetStateAction } from "react";
import {
  currentDateValue,
  currentTimeLabel,
  isKeptDate,
  isKeptMonth,
  timetableCellKey,
  type SavedTimetable,
  type StaffDayMark,
  type StaffDayStatus,
  type StaffPunch,
  type TimetableCell,
  emptyCampusLocation,
  settingsForInstitution,
  type CampusLocation,
  viewerScope,
  deriveFeeStatus,
  feeTotal,
  type AcademicSession,
  type AttendanceMark,
  type CampusSettings,
  type ClassRoom,
  type Exam,
  type FeeRecord,
  type FeeStructure,
  type ListedFeeStatus,
  type HiringCandidate,
  type Inquiry,
  type Institution,
  type MarkRow,
  type Notice,
  type ResultSheet,
  type SheetTextStyle,
  type RoleId,
  type SittingPlan,
  type StaffMember,
  type Student,
  type Subject,
  type Teacher,
} from "./campus-data";
import { routes } from "@/constants/routes";
import { ApiError, createStudentQuery, currentAccount, deleteClassRecord, deleteHiringRecord, deleteInstitutionLogo, deleteResultSheetRecord, deleteStaffRecord, deleteStudentRecord, deleteSubjectRecord, deleteTeacherRecord, isPersistedId, listAttendance, loadCatalog, loadDirectory, loadLedger, loginInstitution, loginStudent, loginTeacher, markStudentQueryRead, readDeviceLocation, saveAttendanceRecords, saveClassRecord, saveFeeRecords, saveHiringRecord, saveInstitutionCredentials, saveInstitutionSettings, savePermissions, saveResultSheetRecord, saveStaffPunch, saveStaffRecord, saveStaffStatus, saveStudentRecord, saveSubjectRecord, saveTeacherRecord, signupInstitution, uploadInstitutionLogo, type AccountRole, type AuthInstitution, type AuthResult } from "@/lib/sems-api";
import { defaultPortalAccess, navForRole, type PortalAccess } from "./campus-nav";
import type { AdminTheme } from "./campus-theme";

interface CampusWorkspace {
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  classes: ClassRoom[];
  subjects: Subject[];
  sessions: AcademicSession[];
  fees: FeeRecord[];
  feeStructures: FeeStructure[];
  attendance: AttendanceMark[];
  exams: Exam[];
  sittingPlans: SittingPlan[];
  marks: MarkRow[];
  notices: Notice[];
  inquiries: Inquiry[];
  hiring: HiringCandidate[];
  timetables: SavedTimetable[];
  resultSheets: ResultSheet[];
  staffPunches: StaffPunch[];
  staffDayMarks: StaffDayMark[];
  settings: CampusSettings;
  access: PortalAccess;
}

interface SignUpInput {
  ownerName: string;
  name: string;
  city: string;
  type: Institution["type"];
  email: string;
  password: string;
}

export type PortalAccount = "owner" | "teacher" | "staff" | "student";

type PortalSignIn = { error: string } | { href: string };

interface AdminContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
  role: RoleId;
  setRole: (role: RoleId) => void;
  portalAccount: PortalAccount;
  actorId: string | null;
  portalStudentId: string;
  portalTeacherClass: string;
  portalName: string;
  query: string;
  setQuery: (value: string) => void;
  notice: string | null;
  clearNotice: () => void;
  session: { institutionId: string } | null;
  institutionCode: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInStudent: (username: string, password: string, institutionId: string) => Promise<PortalSignIn>;
  signInTeacher: (email: string, password: string, institutionId: string) => Promise<PortalSignIn>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  signOut: () => void;
  students: Student[];
  saveStudent: (student: Student) => Promise<string | null>;
  deleteStudent: (id: string) => Promise<string | null>;
  teachers: Teacher[];
  saveTeacher: (teacher: Teacher) => Promise<string | null>;
  deleteTeacher: (id: string) => Promise<string | null>;
  staff: StaffMember[];
  saveStaff: (member: StaffMember) => Promise<string | null>;
  deleteStaff: (id: string) => Promise<string | null>;
  classes: ClassRoom[];
  saveClass: (room: ClassRoom) => Promise<string | null>;
  deleteClass: (id: string) => Promise<string | null>;
  subjects: Subject[];
  saveSubject: (subject: Subject) => Promise<string | null>;
  deleteSubject: (id: string) => Promise<string | null>;
  sessions: AcademicSession[];
  saveSession: (session: AcademicSession) => void;
  fees: FeeRecord[];
  feeStructures: FeeStructure[];
  saveFeeStructure: (structure: FeeStructure) => void;
  generateChallans: (month: string, className?: string) => void;
  recordPayment: (id: string, amount: number, method: string) => void;
  adjustFee: (id: string, patch: Partial<Pick<FeeRecord, "discount" | "lateFee">>) => void;
  setFeeStatus: (studentId: string, month: string, status: ListedFeeStatus) => void;
  attendance: AttendanceMark[];
  saveAttendance: (rows: Array<Omit<AttendanceMark, "id">>) => Promise<string | null>;
  reloadAttendance: () => Promise<void>;
  exams: Exam[];
  saveExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  sittingPlans: SittingPlan[];
  saveSittingPlan: (plan: SittingPlan) => void;
  deleteSittingPlan: (id: string) => void;
  hiring: HiringCandidate[];
  saveHiring: (candidate: HiringCandidate) => Promise<string | null>;
  deleteHiring: (id: string) => Promise<string | null>;
  marks: MarkRow[];
  saveMark: (mark: MarkRow) => void;
  inquiries: Inquiry[];
  replyInquiry: (id: string) => void;
  addStudentQuery: (subject: string, message: string) => void;
  notices: Notice[];
  markNoticeRead: (id: string) => void;
  markAllNoticesRead: () => void;
  institutions: Institution[];
  timetables: SavedTimetable[];
  createTimetable: (classIds: string[]) => string;
  deleteTimetable: (id: string) => void;
  addTimetableRow: (timetableId: string) => void;
  addTimetableColumn: (timetableId: string, classId: string) => void;
  deleteTimetableRow: (timetableId: string, rowId: string) => void;
  deleteTimetableColumn: (timetableId: string, columnId: string) => void;
  setTimetableTime: (timetableId: string, rowId: string, time: string) => void;
  setTimetableColumnClass: (timetableId: string, columnId: string, classId: string) => void;
  setTimetableCell: (timetableId: string, rowId: string, columnId: string, patch: Partial<TimetableCell>) => void;
  setTimetableTextStyle: (timetableId: string, key: string, patch: Partial<SheetTextStyle> | null) => void;
  resultSheets: ResultSheet[];
  saveResultSheet: (sheet: ResultSheet) => void;
  deleteResultSheet: (id: string) => void;
  staffPunches: StaffPunch[];
  staffDayMarks: StaffDayMark[];
  punchStaff: (teacherId: string, teacherName: string, action: "in" | "out") => void;
  setStaffDayMark: (teacherId: string, date: string, status: StaffDayStatus | "") => void;
  settings: CampusSettings;
  updateSettings: (patch: Partial<CampusSettings>) => void;
  saveSettings: () => Promise<string | null>;
  uploadLogo: (file: File) => Promise<string | null>;
  removeLogo: () => Promise<string | null>;
  saveCredentials: (input: { email: string; password: string; currentPassword: string }) => Promise<string | null>;
  access: PortalAccess;
  setPageAccess: (who: keyof PortalAccess, href: string, allowed: boolean) => void;
  saveAccess: (next: PortalAccess) => Promise<string | null>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function landingHref(nextRole: "teacher" | "staff" | "student", access: PortalAccess) {
  return navForRole(nextRole === "staff" ? "teacher" : nextRole, access, nextRole)[0]?.href ?? routes.admin;
}

function campusLocation(value: Partial<CampusLocation> | undefined): CampusLocation {
  const latitude = typeof value?.latitude === "number" && Number.isFinite(value.latitude) ? value.latitude : null;
  const longitude = typeof value?.longitude === "number" && Number.isFinite(value.longitude) ? value.longitude : null;
  return { label: typeof value?.label === "string" ? value.label : "", latitude, longitude };
}

function normalizeCampus(campus: CampusWorkspace): CampusWorkspace {
  return {
    ...campus,
    settings: {
      ...settingsForInstitution({ name: "", city: "" }),
      ...campus.settings,
      logoUrl: typeof campus.settings?.logoUrl === "string" ? campus.settings.logoUrl : "",
      location1: campusLocation(campus.settings?.location1),
      location2: campusLocation(campus.settings?.location2),
      locationCheckEnabled: campus.settings?.locationCheckEnabled === true,
    },
    timetables: Array.isArray(campus.timetables) ? campus.timetables : [],
    resultSheets: Array.isArray(campus.resultSheets) ? campus.resultSheets : [],
    staffPunches: Array.isArray(campus.staffPunches) ? campus.staffPunches : [],
    staffDayMarks: Array.isArray(campus.staffDayMarks) ? campus.staffDayMarks : [],
    inquiries: Array.isArray(campus.inquiries) ? campus.inquiries : [],
    sittingPlans: Array.isArray(campus.sittingPlans) ? campus.sittingPlans : [],
    hiring: Array.isArray(campus.hiring) ? campus.hiring : [],
  };
}

function blankCampus(institution: Pick<Institution, "name" | "city">, email?: string): CampusWorkspace {
  return {
    students: [],
    teachers: [],
    staff: [],
    classes: [],
    subjects: [],
    sessions: [],
    fees: [],
    feeStructures: [],
    attendance: [],
    exams: [],
    sittingPlans: [],
    marks: [],
    notices: [],
    inquiries: [],
    hiring: [],
    timetables: [],
    resultSheets: [],
    staffPunches: [],
    staffDayMarks: [],
    settings: settingsForInstitution(institution, email),
    access: defaultPortalAccess(),
  };
}

const CAMPUS_STORAGE_KEY = "sems-campus-v1";

interface CampusRecord {
  institutions: Institution[];
  campuses: Record<string, CampusWorkspace>;
}

function seedRecord(): CampusRecord {
  return { institutions: [], campuses: {} };
}

function readableCampus(campus: CampusWorkspace): CampusWorkspace {
  const fallback = blankCampus({
    name: campus.settings?.institutionName ?? "",
    city: campus.settings?.city ?? "",
  });
  return normalizeCampus({
    ...fallback,
    ...campus,
    students: Array.isArray(campus.students) ? campus.students : [],
    teachers: Array.isArray(campus.teachers) ? campus.teachers : [],
    staff: Array.isArray(campus.staff) ? campus.staff : [],
    classes: Array.isArray(campus.classes) ? campus.classes : [],
    subjects: Array.isArray(campus.subjects) ? campus.subjects : [],
    sessions: Array.isArray(campus.sessions) ? campus.sessions : fallback.sessions,
    fees: Array.isArray(campus.fees) ? campus.fees : [],
    feeStructures: Array.isArray(campus.feeStructures) ? campus.feeStructures : fallback.feeStructures,
    attendance: Array.isArray(campus.attendance) ? campus.attendance : [],
    exams: Array.isArray(campus.exams) ? campus.exams : [],
    sittingPlans: Array.isArray(campus.sittingPlans) ? campus.sittingPlans : [],
    marks: Array.isArray(campus.marks) ? campus.marks : [],
    notices: Array.isArray(campus.notices) ? campus.notices : [],
    inquiries: Array.isArray(campus.inquiries) ? campus.inquiries : [],
    hiring: Array.isArray(campus.hiring) ? campus.hiring : [],
    resultSheets: Array.isArray(campus.resultSheets) ? campus.resultSheets : [],
    settings: campus.settings ?? fallback.settings,
    access:
      campus.access?.teacher && campus.access?.student
        ? { teacher: campus.access.teacher, student: campus.access.student, staff: Array.isArray(campus.access.staff) ? campus.access.staff : fallback.access.staff }
        : fallback.access,
  });
}

function normalizeRecord(value: Partial<CampusRecord> | null): CampusRecord {
  if (!value || !Array.isArray(value.institutions)) return seedRecord();
  // Only institutions stored on the server are kept. Older demo and locally made campuses are dropped.
  const institutions = value.institutions.filter((institution) => persistedInstitution(institution.id));
  const campuses = Object.fromEntries(
    Object.entries(value.campuses ?? {})
      .filter(([id]) => persistedInstitution(id))
      .map(([id, campus]) => [id, readableCampus(campus)]),
  );
  for (const institution of institutions) {
    if (!campuses[institution.id]) campuses[institution.id] = blankCampus(institution);
  }
  return { institutions, campuses };
}

const serverRecord = seedRecord();
let clientRecord: CampusRecord | null = null;
const recordListeners = new Set<() => void>();

function readClientRecord(): CampusRecord {
  if (clientRecord) return clientRecord;
  try {
    const raw = window.localStorage.getItem(CAMPUS_STORAGE_KEY);
    clientRecord = raw ? normalizeRecord(JSON.parse(raw) as CampusRecord) : seedRecord();
  } catch {
    clientRecord = seedRecord();
  }
  return clientRecord;
}

function writeRecord(next: CampusRecord) {
  clientRecord = next;
  try {
    window.localStorage.setItem(CAMPUS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The browser can refuse the write. This tab still keeps the latest copy.
  }
  recordListeners.forEach((listener) => listener());
}

function subscribeRecord(listener: () => void) {
  recordListeners.add(listener);
  return () => {
    recordListeners.delete(listener);
  };
}

function useCampusRecord() {
  return useSyncExternalStore(subscribeRecord, readClientRecord, () => serverRecord);
}

function patchRecord(recipe: (current: CampusRecord) => CampusRecord) {
  writeRecord(recipe(readClientRecord()));
}

function setCampuses(update: SetStateAction<Record<string, CampusWorkspace>>) {
  patchRecord((current) => ({
    ...current,
    campuses: typeof update === "function" ? update(current.campuses) : update,
  }));
}

function setInstitutions(update: SetStateAction<Institution[]>) {
  patchRecord((current) => ({
    ...current,
    institutions: typeof update === "function" ? update(current.institutions) : update,
  }));
}

const SESSION_KEY = "sems-auth-v1";

interface ClientSession {
  token: string | null;
  institutionId: string;
  role: RoleId;
  portalAccount: PortalAccount;
  actorId: string | null;
}

let clientSession: ClientSession | null | undefined;
const sessionListeners = new Set<() => void>();

export function hasStoredClientSession() {
  return Boolean(readClientSession());
}

function readClientSession(): ClientSession | null {
  if (clientSession !== undefined) return clientSession;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed = raw ? (JSON.parse(raw) as ClientSession) : null;
    clientSession = parsed?.token && parsed.institutionId && persistedInstitution(parsed.institutionId) ? parsed : null;
  } catch {
    clientSession = null;
  }
  return clientSession;
}

function writeSession(next: ClientSession | null) {
  clientSession = next;
  try {
    if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // This tab still keeps the latest session.
  }
  sessionListeners.forEach((listener) => listener());
}

function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function useClientSession() {
  return useSyncExternalStore(subscribeSession, readClientSession, () => null);
}

function persistedInstitution(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

function rememberInstitution(
  institution: AuthInstitution,
  email: string,
  ownerName: string,
  people?: { students: Student[]; teachers: Teacher[]; staff: StaffMember[]; hiring: HiringCandidate[]; attendance: AttendanceMark[] },
  access?: PortalAccess,
  catalog?: { classes: ClassRoom[]; subjects: Subject[] },
  ledger?: { fees: FeeRecord[]; resultSheets: ResultSheet[]; staffPunches: StaffPunch[]; staffDayMarks: StaffDayMark[]; inquiries?: Inquiry[] },
) {
  patchRecord((current) => {
    const existing = current.campuses[institution.id];
    const base = existing ? readableCampus(existing) : blankCampus(institution, email);
    const saved = institution.profileSaved === true;
    const text = (remote: string | undefined, local: string) => (saved ? remote ?? "" : remote || local);
    base.settings = {
      ...base.settings,
      institutionName: institution.institutionName || institution.name || base.settings.institutionName,
      city: institution.city || base.settings.city,
      email: email || institution.email || base.settings.email,
      ownerName: ownerName.trim() || institution.ownerName || base.settings.ownerName,
      tagline: text(institution.tagline, base.settings.tagline),
      phone: text(institution.phone, base.settings.phone),
      address: text(institution.address, base.settings.address),
      session: institution.session || base.settings.session,
      lateFee: typeof institution.lateFee === "number" ? institution.lateFee : base.settings.lateFee,
      reminderDays: typeof institution.reminderDays === "number" ? institution.reminderDays : base.settings.reminderDays,
      feeReminders: typeof institution.feeReminders === "boolean" ? institution.feeReminders : base.settings.feeReminders,
      resultAlerts: typeof institution.resultAlerts === "boolean" ? institution.resultAlerts : base.settings.resultAlerts,
      attendanceAlerts: typeof institution.attendanceAlerts === "boolean" ? institution.attendanceAlerts : base.settings.attendanceAlerts,
      logoUrl: institution.logoUrl || base.settings.logoUrl,
      location1: saved || institution.location1?.latitude != null ? campusLocation(institution.location1) : campusLocation(base.settings.location1),
      location2: saved || institution.location2?.latitude != null ? campusLocation(institution.location2) : campusLocation(base.settings.location2),
      locationCheckEnabled: saved ? institution.locationCheckEnabled === true : institution.locationCheckEnabled === true || base.settings.locationCheckEnabled === true,
    };
    if (people) {
      base.students = people.students;
      base.teachers = people.teachers;
      base.staff = people.staff;
      base.hiring = people.hiring;
      const remoteKeys = new Set(people.attendance.map((row) => `${row.kind}|${row.date}|${row.personId}`));
      const localKept = (Array.isArray(base.attendance) ? base.attendance : []).filter((row) => row.personId && isKeptDate(row.date) && !remoteKeys.has(`${row.kind}|${row.date}|${row.personId}`));
      base.attendance = [...people.attendance, ...localKept];
    }
    if (ledger) {
      base.fees = ledger.fees.filter((fee) => isKeptMonth(fee.month));
      base.resultSheets = ledger.resultSheets.filter((sheet) => isKeptMonth(sheet.month || sheet.savedOn.slice(0, 7)));
      base.staffPunches = ledger.staffPunches.filter((punch) => isKeptDate(punch.date));
      base.staffDayMarks = ledger.staffDayMarks.filter((mark) => isKeptDate(mark.date));
      if (Array.isArray(ledger.inquiries)) base.inquiries = ledger.inquiries.filter((item) => isKeptDate(item.date));
    }
    if (access) {
      base.access = { teacher: [...access.teacher], staff: [...access.staff], student: [...access.student] };
    }
    if (catalog) {
      base.classes = catalog.classes;
      base.subjects = catalog.subjects;
    }
    const nextInstitution = { ...institution, students: people ? people.students.length : institution.students };
    const institutions = current.institutions.some((item) => item.id === nextInstitution.id)
      ? current.institutions.map((item) => (item.id === nextInstitution.id ? { ...item, ...nextInstitution } : item))
      : [nextInstitution, ...current.institutions];
    return { ...current, institutions, campuses: { ...current.campuses, [nextInstitution.id]: base } };
  });
}

function sessionFromAccount(result: AuthResult): ClientSession {
  if (result.role === "student") return { token: result.token, institutionId: result.institution.id, role: "student", portalAccount: "student", actorId: result.actorId };
  if (result.role === "staff") return { token: result.token, institutionId: result.institution.id, role: "teacher", portalAccount: "staff", actorId: result.actorId };
  if (result.role === "teacher") return { token: result.token, institutionId: result.institution.id, role: "teacher", portalAccount: "teacher", actorId: result.actorId };
  return { token: result.token, institutionId: result.institution.id, role: "super_admin", portalAccount: "owner", actorId: null };
}

async function mergeLocalLedger(
  token: string,
  institutionId: string,
  ledger: { fees: FeeRecord[]; resultSheets: ResultSheet[]; staffPunches: StaffPunch[]; staffDayMarks: StaffDayMark[]; inquiries: Inquiry[] },
) {
  const local = readClientRecord().campuses[institutionId];
  if (!local) return ledger;
  const feeKey = (fee: FeeRecord) => `${fee.studentId}|${fee.month}`;
  const punchKey = (punch: StaffPunch) => `${punch.teacherId}|${punch.date}|${punch.action}`;
  const markKey = (mark: StaffDayMark) => `${mark.teacherId}|${mark.date}`;
  const extraFees = (local.fees ?? []).filter((fee) => isKeptMonth(fee.month) && !ledger.fees.some((item) => feeKey(item) === feeKey(fee)));
  const extraSheets = (local.resultSheets ?? []).filter((sheet) => isKeptMonth(sheet.month || sheet.savedOn.slice(0, 7)) && !ledger.resultSheets.some((item) => item.id === sheet.id));
  const extraPunches = (local.staffPunches ?? []).filter((punch) => isKeptDate(punch.date) && !ledger.staffPunches.some((item) => punchKey(item) === punchKey(punch)));
  const extraMarks = (local.staffDayMarks ?? []).filter((mark) => isKeptDate(mark.date) && !ledger.staffDayMarks.some((item) => markKey(item) === markKey(mark)));
  const failedFees: FeeRecord[] = [];
  const failedSheets: ResultSheet[] = [];
  const failedPunches: StaffPunch[] = [];
  const failedMarks: StaffDayMark[] = [];
  let changed = false;
  if (extraFees.length) {
    try {
      await saveFeeRecords(token, extraFees);
      changed = true;
    } catch {
      failedFees.push(...extraFees);
    }
  }
  for (const sheet of extraSheets) {
    try {
      await saveResultSheetRecord(token, sheet);
      changed = true;
    } catch {
      failedSheets.push(sheet);
    }
  }
  for (const punch of extraPunches) {
    const personKind = (local.staff ?? []).some((member) => member.id === punch.teacherId) ? "staff" : "teacher";
    try {
      await saveStaffPunch(token, { personId: punch.teacherId, personName: punch.teacherName, personKind, date: punch.date, action: punch.action, time: punch.time });
      changed = true;
    } catch {
      failedPunches.push(punch);
    }
  }
  for (const mark of extraMarks) {
    const personName = (local.teachers ?? []).find((teacher) => teacher.id === mark.teacherId)?.name ?? (local.staff ?? []).find((member) => member.id === mark.teacherId)?.name ?? "";
    if (!personName) continue;
    const personKind = (local.staff ?? []).some((member) => member.id === mark.teacherId) ? "staff" : "teacher";
    try {
      await saveStaffStatus(token, { personId: mark.teacherId, personName, personKind, date: mark.date, status: mark.status });
      changed = true;
    } catch {
      failedMarks.push(mark);
    }
  }
  const fresh = changed ? await loadLedger(token) : ledger;
  return {
    fees: [...fresh.fees, ...failedFees.filter((fee) => !fresh.fees.some((item) => feeKey(item) === feeKey(fee)))],
    resultSheets: [...fresh.resultSheets, ...failedSheets.filter((sheet) => !fresh.resultSheets.some((item) => item.id === sheet.id))],
    staffPunches: [...fresh.staffPunches, ...failedPunches.filter((punch) => !fresh.staffPunches.some((item) => punchKey(item) === punchKey(punch)))],
    staffDayMarks: [...fresh.staffDayMarks, ...failedMarks.filter((mark) => !fresh.staffDayMarks.some((item) => markKey(item) === markKey(mark)))],
    inquiries: fresh.inquiries,
  };
}

async function enterServerAccount(result: AuthResult) {
  const [people, catalog, remoteLedger] = await Promise.all([loadDirectory(result.token, result.role), loadCatalog(result.token), loadLedger(result.token)]);
  const ledger = await mergeLocalLedger(result.token, result.institution.id, remoteLedger);
  rememberInstitution({ ...result.institution, students: people.students.length }, result.institution.email, result.institution.ownerName, people, result.access, catalog, ledger);
  writeSession(sessionFromAccount(result));
}

function portalHref(role: "teacher" | "staff" | "student", institutionId: string) {
  const access = readClientRecord().campuses[institutionId]?.access ?? defaultPortalAccess();
  return landingHref(role, access);
}

function tokenFor(institutionId: string | null) {
  const current = readClientSession();
  if (!current?.token || !institutionId || current.institutionId !== institutionId) return null;
  return current.token;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [queryPath, setQueryPath] = useState(pathname);
  const [query, setQuery] = useState("");
  if (queryPath !== pathname) {
    setQueryPath(pathname);
    setQuery("");
  }
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [notice, setNotice] = useState<string | null>(null);
  const { campuses, institutions } = useCampusRecord();
  const session = useClientSession();
  useEffect(() => {
    const portal = pathname === routes.admin || pathname.startsWith(`${routes.admin}/`);
    if (portal || pathname.startsWith(routes.platformAdmin)) return;
    if (!readClientSession()) return;
    writeSession(null);
    setNotice(null);
  }, [pathname]);
  const sessionId = session?.institutionId ?? null;
  const role = session?.role ?? "super_admin";
  const portalAccount = session?.portalAccount ?? "owner";
  const actorId = session?.actorId ?? null;

  useEffect(() => {
    if (!session?.token) return;
    let ignore = false;
    const token = session.token;
    const directoryRole: AccountRole = session.portalAccount === "student" ? "student" : session.portalAccount === "staff" ? "staff" : session.portalAccount === "teacher" ? "teacher" : "owner";
    currentAccount(token)
      .then(async (account) => {
        const [people, catalog, remoteLedger] = await Promise.all([loadDirectory(token, directoryRole), loadCatalog(token), loadLedger(token)]);
        if (ignore) return;
        const ledger = await mergeLocalLedger(token, account.institution.id, remoteLedger);
        if (ignore) return;
        rememberInstitution({ ...account.institution, students: people.students.length }, account.institution.email, account.institution.ownerName, people, account.access, catalog, ledger);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        if (error instanceof ApiError && error.message !== "Could not reach the server.") writeSession(null);
      });
    return () => {
      ignore = true;
    };
  }, [session?.token, session?.portalAccount]);

  const campus = normalizeCampus((sessionId && campuses[sessionId]) || blankCampus({ name: "", city: "" }));
  const signedStudent = portalAccount === "student" ? campus.students.find((student) => student.id === actorId) : undefined;
  const signedTeacher = portalAccount === "teacher" ? campus.teachers.find((teacher) => teacher.id === actorId) : undefined;
  const signedStaff = portalAccount === "staff" ? campus.staff.find((member) => member.id === actorId) : undefined;
  const portalStudentId = signedStudent?.id ?? viewerScope.studentId;
  const portalTeacherClass = signedTeacher?.classes.split(",")[0]?.trim() || viewerScope.teacherClass;
  const portalName = signedStudent?.name ?? signedTeacher?.name ?? signedStaff?.name ?? "";

  function flash(message: string) {
    setNotice(message);
  }

  function updateCampus(recipe: (current: CampusWorkspace) => CampusWorkspace) {
    setCampuses((current) => {
      if (!sessionId || !current[sessionId]) return current;
      return { ...current, [sessionId]: recipe(normalizeCampus(current[sessionId])) };
    });
  }

  function storeFees(records: FeeRecord[]) {
    const token = tokenFor(sessionId);
    const kept = records.filter((fee) => isKeptMonth(fee.month));
    if (!token || kept.length === 0) return;
    saveFeeRecords(token, kept)
      .then((saved) => {
        updateCampus((current) => ({
          ...current,
          fees: current.fees.map((fee) => saved.find((item) => item.studentId === fee.studentId && item.month === fee.month) ?? fee),
        }));
      })
      .catch((error: unknown) => {
        flash(error instanceof ApiError ? error.message : "Could not save the fee record.");
      });
  }

  function staffKind(personId: string): "teacher" | "staff" {
    return campus.staff.some((member) => member.id === personId) ? "staff" : "teacher";
  }

  function storeStaffPunch(personId: string, personName: string, action: "in" | "out", date: string, time: string) {
    const token = tokenFor(sessionId);
    if (!token) return;
    saveStaffPunch(token, { personId, personName, personKind: staffKind(personId), date, action, time }).catch((error: unknown) => {
      flash(error instanceof ApiError ? error.message : "Could not save attendance.");
    });
  }

  function storeStaffStatus(personId: string, date: string, status: StaffDayStatus | "") {
    const token = tokenFor(sessionId);
    if (!token) return;
    const personName = campus.teachers.find((teacher) => teacher.id === personId)?.name ?? campus.staff.find((member) => member.id === personId)?.name ?? "";
    if (!personName) return;
    saveStaffStatus(token, { personId, personName, personKind: staffKind(personId), date, status }).catch((error: unknown) => {
      flash(error instanceof ApiError ? error.message : "Could not save attendance.");
    });
  }

  function updateTimetable(id: string, recipe: (item: SavedTimetable) => SavedTimetable) {
    updateCampus((current) => ({
      ...current,
      timetables: current.timetables.map((item) => (item.id === id ? recipe(item) : item)),
    }));
  }

  const value: AdminContextValue = {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    role,
    setRole: (next) => {
      const current = readClientSession();
      if (!current || current.portalAccount !== "owner") return;
      writeSession({ ...current, role: next });
      flash(`Signed in as ${next.replaceAll("_", " ")}.`);
    },
    portalAccount,
    actorId,
    portalStudentId,
    portalTeacherClass,
    portalName,
    query,
    setQuery,
    notice,
    clearNotice: () => setNotice(null),
    session: sessionId ? { institutionId: sessionId } : null,
    institutionCode: institutions.find((item) => item.id === sessionId)?.code ?? "",
    signIn: async (email, password) => {
      try {
        const result = await loginInstitution({ email, password });
        await enterServerAccount(result);
        setNotice(null);
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not log in.";
      }
    },
    signInStudent: async (username, password, institutionId) => {
      try {
        const result = await loginStudent({ username, password, institutionId });
        await enterServerAccount(result);
        setNotice(null);
        return { href: portalHref("student", result.institution.id) };
      } catch (error) {
        return { error: error instanceof ApiError ? error.message : "Could not log in." };
      }
    },
    signInTeacher: async (email, password, institutionId) => {
      const place = await readDeviceLocation();
      const latitude = "latitude" in place ? place.latitude : undefined;
      const longitude = "longitude" in place ? place.longitude : undefined;
      try {
        const result = await loginTeacher({ email, password, institutionId, latitude, longitude });
        await enterServerAccount(result);
        setNotice(null);
        const who = result.role === "staff" ? "staff" : "teacher";
        return { href: portalHref(who, result.institution.id) };
      } catch (error) {
        return { error: error instanceof ApiError ? error.message : "Could not log in." };
      }
    },
    signUp: async ({ ownerName, name, city, type, email, password }) => {
      try {
        const result = await signupInstitution({ ownerName, name, city, type, email, password });
        await enterServerAccount(result);
        setNotice(`${result.institution.name} is open. Campus key ${result.institution.code}. People added here stay inside this institution.`);
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not create the institution.";
      }
    },
    signOut: () => {
      writeSession(null);
      setNotice(null);
    },
    students: campus.students,
    saveStudent: async (student) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => {
          const exists = current.students.some((item) => item.id === student.id);
          return { ...current, students: exists ? current.students.map((item) => (item.id === student.id ? student : item)) : [student, ...current.students] };
        });
        flash(campus.students.some((item) => item.id === student.id) ? "Student profile updated." : "Student admitted.");
        return null;
      }
      try {
        const saved = await saveStudentRecord(token, student);
        updateCampus((current) => ({ ...current, students: [saved, ...current.students.filter((item) => item.id !== student.id && item.id !== saved.id)] }));
        flash(isPersistedId(student.id) ? "Student profile updated." : "Student admitted.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the student.";
      }
    },
    deleteStudent: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteStudentRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the student.";
        }
      }
      updateCampus((current) => ({ ...current, students: current.students.filter((item) => item.id !== id) }));
      flash("Student record removed.");
      return null;
    },
    teachers: campus.teachers,
    saveTeacher: async (teacher) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({
          ...current,
          teachers: current.teachers.some((item) => item.id === teacher.id) ? current.teachers.map((item) => (item.id === teacher.id ? teacher : item)) : [teacher, ...current.teachers],
        }));
        flash("Teacher record saved.");
        return null;
      }
      try {
        const saved = await saveTeacherRecord(token, teacher);
        updateCampus((current) => ({ ...current, teachers: [saved, ...current.teachers.filter((item) => item.id !== teacher.id && item.id !== saved.id)] }));
        flash("Teacher record saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the teacher.";
      }
    },
    deleteTeacher: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteTeacherRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the teacher.";
        }
      }
      updateCampus((current) => ({ ...current, teachers: current.teachers.filter((item) => item.id !== id) }));
      flash("Teacher record removed.");
      return null;
    },
    staff: campus.staff,
    saveStaff: async (member) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({
          ...current,
          staff: current.staff.some((item) => item.id === member.id) ? current.staff.map((item) => (item.id === member.id ? member : item)) : [member, ...current.staff],
        }));
        flash("Staff record saved.");
        return null;
      }
      try {
        const saved = await saveStaffRecord(token, member);
        updateCampus((current) => ({ ...current, staff: [saved, ...current.staff.filter((item) => item.id !== member.id && item.id !== saved.id)] }));
        flash("Staff record saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the staff member.";
      }
    },
    deleteStaff: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteStaffRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the staff member.";
        }
      }
      updateCampus((current) => ({ ...current, staff: current.staff.filter((item) => item.id !== id) }));
      flash("Staff record removed.");
      return null;
    },
    classes: campus.classes,
    saveClass: async (room) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({
          ...current,
          classes: current.classes.some((item) => item.id === room.id) ? current.classes.map((item) => (item.id === room.id ? room : item)) : [room, ...current.classes],
        }));
        flash("Class saved.");
        return null;
      }
      try {
        const saved = await saveClassRecord(token, room);
        updateCampus((current) => ({ ...current, classes: [saved, ...current.classes.filter((item) => item.id !== room.id && item.id !== saved.id)].sort((a, b) => a.name.localeCompare(b.name) || a.section.localeCompare(b.section)) }));
        flash(isPersistedId(room.id) ? "Class updated." : "Class saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the class.";
      }
    },
    deleteClass: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteClassRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the class.";
        }
      }
      updateCampus((current) => ({ ...current, classes: current.classes.filter((item) => item.id !== id) }));
      flash("Class removed.");
      return null;
    },
    subjects: campus.subjects,
    saveSubject: async (subject) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({
          ...current,
          subjects: current.subjects.some((item) => item.id === subject.id) ? current.subjects.map((item) => (item.id === subject.id ? subject : item)) : [subject, ...current.subjects],
        }));
        flash("Subject saved.");
        return null;
      }
      try {
        const saved = await saveSubjectRecord(token, subject);
        updateCampus((current) => ({ ...current, subjects: [saved, ...current.subjects.filter((item) => item.id !== subject.id && item.id !== saved.id)].sort((a, b) => a.name.localeCompare(b.name)) }));
        flash(isPersistedId(subject.id) ? "Subject updated." : "Subject saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the subject.";
      }
    },
    deleteSubject: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteSubjectRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the subject.";
        }
      }
      updateCampus((current) => ({ ...current, subjects: current.subjects.filter((item) => item.id !== id) }));
      flash("Subject removed.");
      return null;
    },
    sessions: campus.sessions,
    saveSession: (session) => {
      updateCampus((current) => {
        const next = current.sessions.some((item) => item.id === session.id) ? current.sessions.map((item) => (item.id === session.id ? session : item)) : [session, ...current.sessions];
        return {
          ...current,
          sessions: session.status === "active" ? next.map((item) => (item.id === session.id ? item : { ...item, status: item.status === "active" ? "closed" : item.status })) : next,
        };
      });
      flash("Academic session saved.");
    },
    fees: campus.fees,
    feeStructures: campus.feeStructures,
    saveFeeStructure: (structure) => {
      updateCampus((current) => ({ ...current, feeStructures: current.feeStructures.map((item) => (item.id === structure.id ? structure : item)) }));
      flash(`Fee structure updated for ${structure.className}.`);
    },
    generateChallans: (month, className) => {
      if (!isKeptMonth(month)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      const created: FeeRecord[] = [];
      for (const student of campus.students) {
        if (student.status !== "active") continue;
        if (className && student.className !== className) continue;
        if (campus.fees.some((fee) => fee.studentId === student.id && fee.month === month)) continue;
        const structure = campus.feeStructures.find((item) => item.className === student.className);
        const tuition = structure?.tuition ?? 0;
        const other = (structure?.transport ?? 0) + (structure?.lab ?? 0);
        created.push({
          id: nextId("fee"),
          challanNo: `CH-${month.replace("-", "")}-${student.admissionNo}`,
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          month,
          tuition,
          other,
          discount: 0,
          lateFee: 0,
          paid: 0,
          method: "—",
          dueDate: `${month}-10`,
        });
      }
      updateCampus((current) => ({ ...current, fees: [...created, ...current.fees] }));
      storeFees(created);
      flash(created.length === 0 ? "Challans for that month already exist." : `${created.length} fee slips generated.`);
    },
    recordPayment: (id, amount, method) => {
      const fee = campus.fees.find((item) => item.id === id);
      if (!fee || !isKeptMonth(fee.month)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      const next = { ...fee, paid: fee.paid + amount, method };
      updateCampus((current) => ({
        ...current,
        fees: current.fees.map((item) => (item.id === id ? next : item)),
      }));
      storeFees([next]);
      flash("Payment recorded.");
    },
    adjustFee: (id, patch) => {
      const fee = campus.fees.find((item) => item.id === id);
      if (!fee || !isKeptMonth(fee.month)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      const next = { ...fee, ...patch };
      updateCampus((current) => ({ ...current, fees: current.fees.map((item) => (item.id === id ? next : item)) }));
      storeFees([next]);
      flash("Fee adjustment saved.");
    },
    setFeeStatus: (studentId, month, status) => {
      if (!isKeptMonth(month)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      const student = campus.students.find((item) => item.id === studentId);
      if (!student) return;
      const existing = campus.fees.find((fee) => fee.studentId === studentId && fee.month === month);
      const structure = campus.feeStructures.find((item) => item.className === student.className);
      const base = existing ?? {
        id: nextId("fee"),
        challanNo: `CH-${month.replace("-", "")}-${student.admissionNo}`,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        month,
        tuition: structure?.tuition ?? 0,
        other: (structure?.transport ?? 0) + (structure?.lab ?? 0),
        discount: 0,
        lateFee: 0,
        paid: 0,
        method: "—",
        dueDate: `${month}-10`,
      };
      const total = feeTotal(base);
      const paid = status === "paid" ? total : status === "unpaid" ? 0 : base.paid >= total ? 0 : base.paid;
      const next = { ...base, studentName: student.name, className: student.className, status, paid, method: status === "paid" ? "Cash" : base.method };
      updateCampus((current) => ({ ...current, fees: existing ? current.fees.map((fee) => (fee.id === existing.id ? next : fee)) : [next, ...current.fees] }));
      storeFees([next]);
      flash(`Fee marked ${status}.`);
    },
    attendance: campus.attendance,
    saveAttendance: async (rows) => {
      const apply = (saved: AttendanceMark[]) => {
        updateCampus((current) => {
          const keys = new Set(saved.map((row) => `${row.date}|${row.personId}`));
          const kept = current.attendance.filter((row) => !keys.has(`${row.date}|${row.personId}`));
          return { ...current, attendance: [...saved, ...kept] };
        });
      };
      const token = tokenFor(sessionId);
      if (!token) {
        apply(rows.map((row) => ({ ...row, id: nextId("att") })));
        flash("Attendance saved.");
        return null;
      }
      try {
        const saved = await saveAttendanceRecords(token, rows);
        apply(saved);
        flash("Attendance saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save attendance.";
      }
    },
    reloadAttendance: async () => {
      const token = tokenFor(sessionId);
      if (!token) return;
      try {
        const rows = await listAttendance(token);
        updateCampus((current) => {
          const remoteKeys = new Set(rows.map((row) => `${row.kind}|${row.date}|${row.personId}`));
          const localKept = current.attendance.filter((row) => row.personId && !remoteKeys.has(`${row.kind}|${row.date}|${row.personId}`));
          return { ...current, attendance: [...rows, ...localKept] };
        });
      } catch {
        // Keep the attendance already on screen if the server cannot be reached.
      }
    },
    exams: campus.exams,
    saveExam: (exam) => {
      updateCampus((current) => ({
        ...current,
        exams: current.exams.some((item) => item.id === exam.id) ? current.exams.map((item) => (item.id === exam.id ? exam : item)) : [exam, ...current.exams],
      }));
      flash("Examination saved.");
    },
    deleteExam: (id) => {
      updateCampus((current) => ({
        ...current,
        exams: current.exams.filter((item) => item.id !== id),
        marks: current.marks.filter((item) => item.examId !== id),
      }));
      flash("Examination removed.");
    },
    sittingPlans: campus.sittingPlans,
    saveSittingPlan: (plan) => {
      updateCampus((current) => ({
        ...current,
        sittingPlans: current.sittingPlans.some((item) => item.id === plan.id) ? current.sittingPlans.map((item) => (item.id === plan.id ? plan : item)) : [plan, ...current.sittingPlans],
      }));
      flash("Sitting plan saved.");
    },
    deleteSittingPlan: (id) => {
      updateCampus((current) => ({ ...current, sittingPlans: current.sittingPlans.filter((item) => item.id !== id) }));
      flash("Sitting plan removed.");
    },
    hiring: campus.hiring,
    saveHiring: async (candidate) => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({
          ...current,
          hiring: current.hiring.some((item) => item.id === candidate.id) ? current.hiring.map((item) => (item.id === candidate.id ? candidate : item)) : [candidate, ...current.hiring],
        }));
        flash("Hiring record saved.");
        return null;
      }
      try {
        const saved = await saveHiringRecord(token, candidate);
        updateCampus((current) => ({ ...current, hiring: [saved, ...current.hiring.filter((item) => item.id !== candidate.id && item.id !== saved.id)] }));
        flash(isPersistedId(candidate.id) ? "Hiring record updated." : "Hiring record saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save the hiring record.";
      }
    },
    deleteHiring: async (id) => {
      const token = tokenFor(sessionId);
      if (token && isPersistedId(id)) {
        try {
          await deleteHiringRecord(token, id);
        } catch (error) {
          return error instanceof ApiError ? error.message : "Could not delete the hiring record.";
        }
      }
      updateCampus((current) => ({ ...current, hiring: current.hiring.filter((item) => item.id !== id) }));
      flash("Hiring record removed.");
      return null;
    },
    marks: campus.marks,
    saveMark: (mark) => {
      updateCampus((current) => {
        const index = current.marks.findIndex((item) => item.examId === mark.examId && item.studentId === mark.studentId && item.subject === mark.subject);
        if (index === -1) return { ...current, marks: [mark, ...current.marks] };
        return { ...current, marks: current.marks.map((item, itemIndex) => (itemIndex === index ? { ...mark, id: item.id } : item)) };
      });
      flash("Marks saved. Percentage, grade, and position will refresh.");
    },
    inquiries: campus.inquiries,
    replyInquiry: (id) => {
      const previous = campus.inquiries.find((item) => item.id === id);
      updateCampus((current) => ({ ...current, inquiries: current.inquiries.map((item) => (item.id === id ? { ...item, status: "read" } : item)) }));
      const token = tokenFor(sessionId);
      if (!token || !isPersistedId(id)) {
        flash("Query marked as read.");
        return;
      }
      markStudentQueryRead(token, id)
        .then((saved) => {
          updateCampus((current) => ({ ...current, inquiries: current.inquiries.map((item) => (item.id === id ? saved : item)) }));
          flash("Query marked as read.");
        })
        .catch((error: unknown) => {
          if (previous) updateCampus((current) => ({ ...current, inquiries: current.inquiries.map((item) => (item.id === id ? previous : item)) }));
          flash(error instanceof ApiError ? error.message : "Could not update the query.");
        });
    },
    addStudentQuery: (subject, message) => {
      const token = tokenFor(sessionId);
      if (!token) {
        flash("Log in as a student to send a query.");
        return;
      }
      createStudentQuery(token, { subject: subject.trim(), message: message.trim() })
        .then((saved) => {
          updateCampus((current) => ({ ...current, inquiries: [saved, ...current.inquiries.filter((item) => item.id !== saved.id)] }));
          flash("Query sent to the institution.");
        })
        .catch((error: unknown) => {
          flash(error instanceof ApiError ? error.message : "Could not send the query.");
        });
    },
    notices: campus.notices,
    markNoticeRead: (id) => updateCampus((current) => ({ ...current, notices: current.notices.map((item) => (item.id === id ? { ...item, read: true } : item)) })),
    markAllNoticesRead: () => updateCampus((current) => ({ ...current, notices: current.notices.map((item) => ({ ...item, read: true })) })),
    institutions,
    timetables: campus.timetables,
    createTimetable: (classIds) => {
      const id = nextId("tt");
      updateCampus((current) => ({
        ...current,
        timetables: [
          ...current.timetables,
          {
            id,
            title: `Timetable ${current.timetables.length + 1}`,
            columns: classIds.map((classId) => ({ id: nextId("col"), classId })),
            rows: [{ id: nextId("row"), time: "08:00" }],
            cells: {},
          },
        ],
      }));
      return id;
    },
    deleteTimetable: (id) => {
      updateCampus((current) => ({ ...current, timetables: current.timetables.filter((item) => item.id !== id) }));
      flash("Timetable removed.");
    },
    resultSheets: campus.resultSheets,
    saveResultSheet: (sheet) => {
      const month = sheet.month || sheet.savedOn.slice(0, 7);
      if (!isKeptMonth(month)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      updateCampus((current) => ({
        ...current,
        resultSheets: current.resultSheets.some((item) => item.id === sheet.id) ? current.resultSheets.map((item) => (item.id === sheet.id ? sheet : item)) : [sheet, ...current.resultSheets],
      }));
      const token = tokenFor(sessionId);
      if (token) {
        saveResultSheetRecord(token, sheet)
          .then((saved) => {
            updateCampus((current) => ({ ...current, resultSheets: current.resultSheets.map((item) => (item.id === sheet.id || item.id === saved.id ? saved : item)) }));
          })
          .catch((error: unknown) => {
            flash(error instanceof ApiError ? error.message : "Could not save the result sheet.");
          });
      }
      flash("Result sheet saved.");
    },
    deleteResultSheet: (id) => {
      updateCampus((current) => ({ ...current, resultSheets: current.resultSheets.filter((item) => item.id !== id) }));
      const token = tokenFor(sessionId);
      if (token) {
        deleteResultSheetRecord(token, id).catch((error: unknown) => {
          if (error instanceof ApiError && error.message === "That result sheet was not found.") return;
          flash(error instanceof ApiError ? error.message : "Could not delete the result sheet.");
        });
      }
      flash("Result sheet removed.");
    },
    addTimetableRow: (timetableId) =>
      updateTimetable(timetableId, (item) => ({ ...item, rows: [...item.rows, { id: nextId("row"), time: "08:00" }] })),
    addTimetableColumn: (timetableId, classId) =>
      updateTimetable(timetableId, (item) => ({ ...item, columns: [...item.columns, { id: nextId("col"), classId }] })),
    deleteTimetableRow: (timetableId, rowId) =>
      updateTimetable(timetableId, (item) => {
        const cells = { ...item.cells };
        for (const column of item.columns) delete cells[timetableCellKey(rowId, column.id)];
        return { ...item, rows: item.rows.filter((row) => row.id !== rowId), cells };
      }),
    deleteTimetableColumn: (timetableId, columnId) =>
      updateTimetable(timetableId, (item) => {
        const cells = { ...item.cells };
        for (const row of item.rows) delete cells[timetableCellKey(row.id, columnId)];
        return { ...item, columns: item.columns.filter((column) => column.id !== columnId), cells };
      }),
    setTimetableTime: (timetableId, rowId, time) =>
      updateTimetable(timetableId, (item) => ({ ...item, rows: item.rows.map((row) => (row.id === rowId ? { ...row, time } : row)) })),
    setTimetableColumnClass: (timetableId, columnId, classId) =>
      updateTimetable(timetableId, (item) => ({ ...item, columns: item.columns.map((column) => (column.id === columnId ? { ...column, classId } : column)) })),
    setTimetableCell: (timetableId, rowId, columnId, patch) =>
      updateTimetable(timetableId, (item) => {
        const key = timetableCellKey(rowId, columnId);
        const currentCell = item.cells[key] ?? { subject: "", teacher: "" };
        return { ...item, cells: { ...item.cells, [key]: { ...currentCell, ...patch } } };
      }),
    setTimetableTextStyle: (timetableId, key, patch) =>
      updateTimetable(timetableId, (item) => {
        const textStyles = { ...(item.textStyles ?? {}) };
        if (!patch) delete textStyles[key];
        else textStyles[key] = { ...textStyles[key], ...patch };
        return { ...item, textStyles };
      }),
    staffPunches: campus.staffPunches,
    staffDayMarks: campus.staffDayMarks,
    punchStaff: (teacherId, teacherName, action) => {
      const date = currentDateValue();
      const away = campus.staffDayMarks.some((mark) => mark.teacherId === teacherId && mark.date === date && (mark.status === "absent" || mark.status === "leave"));
      const already = campus.staffPunches.some((punch) => punch.teacherId === teacherId && punch.date === date && punch.action === action);
      if (away || already) return;
      const time = currentTimeLabel();
      const punch: StaffPunch = {
        id: nextId("punch"),
        teacherId,
        teacherName,
        date,
        action,
        time,
      };
      updateCampus((current) => {
        const taken = current.staffPunches.some((item) => item.teacherId === teacherId && item.date === date && item.action === action);
        if (taken) return current;
        return { ...current, staffPunches: [...current.staffPunches, punch] };
      });
      storeStaffPunch(teacherId, teacherName, action, date, time);
      flash(action === "in" ? "In time recorded." : "Out time recorded.");
    },
    setStaffDayMark: (teacherId, date, status) => {
      if (!isKeptDate(date)) {
        flash("Only the current month and the previous month can be stored.");
        return;
      }
      updateCampus((current) => {
        const rest = current.staffDayMarks.filter((item) => !(item.teacherId === teacherId && item.date === date));
        return { ...current, staffDayMarks: status ? [...rest, { teacherId, date, status }] : rest };
      });
      storeStaffStatus(teacherId, date, status);
    },
    settings: campus.settings,
    updateSettings: (patch) => {
      updateCampus((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
      if (!sessionId) return;
      if (patch.institutionName || patch.city) {
        setInstitutions((current) =>
          current.map((item) =>
            item.id === sessionId
              ? { ...item, name: patch.institutionName ?? item.name, city: patch.city ?? item.city }
              : item,
          ),
        );
      }
    },
    saveSettings: async () => {
      const token = tokenFor(sessionId);
      const currentSettings = (sessionId && readClientRecord().campuses[sessionId]?.settings) || campus.settings;
      const profile = {
        ownerName: currentSettings.ownerName,
        institutionName: currentSettings.institutionName,
        tagline: currentSettings.tagline,
        email: currentSettings.email,
        phone: currentSettings.phone,
        city: currentSettings.city,
        address: currentSettings.address,
        session: currentSettings.session,
        lateFee: currentSettings.lateFee,
        reminderDays: currentSettings.reminderDays,
        feeReminders: currentSettings.feeReminders,
        resultAlerts: currentSettings.resultAlerts,
        attendanceAlerts: currentSettings.attendanceAlerts,
        location1: currentSettings.location1 ?? emptyCampusLocation,
        location2: currentSettings.location2 ?? emptyCampusLocation,
        locationCheckEnabled: currentSettings.locationCheckEnabled === true,
      };
      if (!token) {
        flash("Institution settings saved.");
        return null;
      }
      try {
        const saved = await saveInstitutionSettings(token, profile);
        updateCampus((current) => ({ ...current, settings: { ...current.settings, ...saved } }));
        if (sessionId) {
          setInstitutions((current) =>
            current.map((item) => (item.id === sessionId ? { ...item, name: saved.institutionName, city: saved.city } : item)),
          );
        }
        flash("Institution settings saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save settings.";
      }
    },
    uploadLogo: async (file) => {
      const token = tokenFor(sessionId);
      if (!token) return "Log in as the institution owner to store the logo.";
      try {
        const saved = await uploadInstitutionLogo(token, file);
        updateCampus((current) => ({ ...current, settings: { ...current.settings, logoUrl: saved.logoUrl } }));
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not store the logo.";
      }
    },
    removeLogo: async () => {
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({ ...current, settings: { ...current.settings, logoUrl: "" } }));
        return null;
      }
      try {
        const saved = await deleteInstitutionLogo(token);
        updateCampus((current) => ({ ...current, settings: { ...current.settings, logoUrl: saved.logoUrl } }));
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not remove the logo.";
      }
    },
    saveCredentials: async (input) => {
      const token = tokenFor(sessionId);
      if (!token) return "Log in as the institution owner to change the sign-in details.";
      try {
        const saved = await saveInstitutionCredentials(token, input);
        updateCampus((current) => ({ ...current, settings: { ...current.settings, email: saved.email } }));
        flash("Sign-in details updated.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not update the sign-in details.";
      }
    },
    access: campus.access,
    setPageAccess: (who, href, allowed) => {
      updateCampus((current) => {
        const list = current.access[who];
        const next = allowed ? (list.includes(href) ? list : [...list, href]) : list.filter((item) => item !== href);
        return { ...current, access: { ...current.access, [who]: next } };
      });
    },
    saveAccess: async (next) => {
      const saved = { teacher: [...next.teacher], staff: [...next.staff], student: [...next.student] };
      const token = tokenFor(sessionId);
      if (!token) {
        updateCampus((current) => ({ ...current, access: saved }));
        flash("Permissions saved.");
        return null;
      }
      try {
        const stored = await savePermissions(token, saved);
        updateCampus((current) => ({ ...current, access: stored }));
        flash("Permissions saved.");
        return null;
      } catch (error) {
        return error instanceof ApiError ? error.message : "Could not save permissions.";
      }
    },
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used within AdminProvider");
  return value;
}

export { deriveFeeStatus };
