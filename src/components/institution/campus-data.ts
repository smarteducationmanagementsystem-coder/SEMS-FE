export type RoleId = "super_admin" | "institution_admin" | "teacher" | "accountant" | "student" | "parent";
export type FeeStatus = "paid" | "unpaid" | "partial";
export type ListedFeeStatus = "paid" | "unpaid" | "pending";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type PersonStatus = "active" | "inactive" | "on leave";

export const roleOrder: RoleId[] = ["super_admin", "institution_admin", "teacher", "accountant", "student", "parent"];

/** Roles offered in the portal switcher beside dark mode. */
export const portalSwitchRoles: RoleId[] = ["super_admin", "teacher", "student"];

export function personaFor(role: RoleId, ownerName: string): { label: string; name: string; title: string } {
  if (role === "super_admin") {
    const name = ownerName.trim() || "Owner";
    return { label: "Super Admin", name, title: "Institution owner" };
  }
  return roleMeta[role];
}

export const roleMeta: Record<RoleId, { label: string; name: string; title: string }> = {
  super_admin: { label: "Super Admin", name: "Owner", title: "Institution owner" },
  institution_admin: { label: "Institution Admin", name: "Institution admin", title: "Institution account" },
  teacher: { label: "Teacher", name: "Teacher", title: "Teacher" },
  accountant: { label: "Accountant", name: "Accountant", title: "Accounts office" },
  student: { label: "Student", name: "Student", title: "Student" },
  parent: { label: "Parent", name: "Parent", title: "Parent" },
};

/** Nothing is preselected. A signed-in portal account is matched by its own saved record. */
export const viewerScope = {
  teacherClass: "",
  studentId: "",
  parentStudentIds: [] as string[],
};

export interface Student {
  id: string;
  institutionCode?: string;
  admissionNo: string;
  name: string;
  gender: "Female" | "Male";
  className: string;
  section: string;
  session: string;
  guardian: string;
  guardianPhone: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  status: PersonStatus;
  enrolledOn: string;
}

export interface Teacher {
  id: string;
  institutionCode?: string;
  employeeNo: string;
  name: string;
  subject: string;
  classes: string;
  phone: string;
  email: string;
  qualification: string;
  joinedOn: string;
  status: PersonStatus;
}

export interface StaffMember {
  id: string;
  institutionCode?: string;
  employeeNo: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  joinedOn: string;
  status: PersonStatus;
}

export interface ClassRoom {
  id: string;
  name: string;
  section: string;
  session: string;
  teacher: string;
  room: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  className: string;
  teacher: string;
  weeklyPeriods: number;
}

export interface AcademicSession {
  id: string;
  name: string;
  start: string;
  end: string;
  status: "active" | "upcoming" | "closed";
}

export interface FeeStructure {
  id: string;
  className: string;
  tuition: number;
  transport: number;
  lab: number;
}

export interface FeeRecord {
  id: string;
  challanNo: string;
  studentId: string;
  studentName: string;
  className: string;
  month: string;
  tuition: number;
  other: number;
  discount: number;
  lateFee: number;
  paid: number;
  method: string;
  dueDate: string;
  status?: ListedFeeStatus;
}

export interface AttendanceMark {
  id: string;
  date: string;
  personId: string;
  personName: string;
  kind: "student" | "staff";
  className: string;
  section?: string;
  status: AttendanceStatus;
}

export interface Exam {
  id: string;
  name: string;
  session: string;
  className: string;
  startDate: string;
  endDate: string;
  status: "scheduled" | "ongoing" | "published";
}

export interface SittingRoom {
  room: string;
  count: number;
}

export interface SittingSeat {
  studentId: string;
  studentName: string;
  room: string;
  seatNo: number;
}

export interface SittingPlan {
  id: string;
  className: string;
  section: string;
  rooms: SittingRoom[];
  seats: SittingSeat[];
  createdOn: string;
}

export interface ResultColumn {
  id: string;
  name: string;
  width: number;
  total?: number;
}

export interface ResultRow {
  id: string;
  name: string;
  height: number;
  marks: Record<string, string>;
}

export interface SheetTextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  background?: string;
}

export interface ResultSheet {
  id: string;
  title: string;
  className?: string;
  section?: string;
  month?: string;
  nameWidth: number;
  noWidth?: number;
  marksWidth?: number;
  obtainedWidth?: number;
  percentWidth?: number;
  positionWidth?: number;
  subjectRowHeight?: number;
  labelRowHeight?: number;
  columns: ResultColumn[];
  rows: ResultRow[];
  textStyles?: Record<string, SheetTextStyle>;
  savedOn: string;
}

export interface HiringCandidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: "Female" | "Male";
  address: string;
  qualification: string;
  subject: string;
}

export interface MarkRow {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  total: number;
  obtained: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  institution: string;
  message: string;
  status: "new" | "read" | "replied";
  date: string;
  subject?: string;
  className?: string;
  studentId?: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: string;
  date: string;
  read: boolean;
}

export interface Institution {
  id: string;
  code?: string;
  name: string;
  city: string;
  type: "School" | "College" | "Academy";
  students: number;
  plan: "Basic" | "Professional" | "Enterprise";
  status: "active" | "trial";
}

export interface CampusLocation {
  label: string;
  latitude: number | null;
  longitude: number | null;
}

export const emptyCampusLocation: CampusLocation = { label: "", latitude: null, longitude: null };

export function displayLogo(logoUrl: string) {
  const value = logoUrl.trim();
  if (!value || /[\s"'<>]/.test(value)) return "";
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("https://res.cloudinary.com/")) return value;
  if (value.startsWith("/api/institution/brand/") && value.includes("/logo")) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
    return `${base}${value}`;
  }
  return "";
}

export interface CampusSettings {
  institutionName: string;
  tagline: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  session: string;
  lateFee: number;
  reminderDays: number;
  feeReminders: boolean;
  resultAlerts: boolean;
  attendanceAlerts: boolean;
  ownerName: string;
  logoUrl: string;
  location1: CampusLocation;
  location2: CampusLocation;
  locationCheckEnabled: boolean;
}

export function settingsForInstitution(institution: Pick<Institution, "name" | "city">, email?: string, ownerName = ""): CampusSettings {
  return {
    institutionName: institution.name,
    tagline: institution.name,
    email: email ?? "",
    phone: "",
    city: institution.city,
    address: "",
    session: "2026–27",
    lateFee: 500,
    reminderDays: 3,
    feeReminders: true,
    resultAlerts: true,
    attendanceAlerts: true,
    ownerName: ownerName.trim(),
    logoUrl: "",
    location1: { ...emptyCampusLocation },
    location2: { ...emptyCampusLocation },
    locationCheckEnabled: false,
  };
}

export interface TimetableColumn {
  id: string;
  classId: string;
}

export interface TimetableRow {
  id: string;
  time: string;
}

export interface TimetableCell {
  subject: string;
  teacher: string;
}

export interface SavedTimetable {
  id: string;
  title: string;
  columns: TimetableColumn[];
  rows: TimetableRow[];
  cells: Record<string, TimetableCell>;
  textStyles?: Record<string, SheetTextStyle>;
}

export function timetableCellKey(rowId: string, columnId: string) {
  return `${rowId}|${columnId}`;
}

export type StaffDayStatus = "present" | "late" | "absent" | "leave";

export interface StaffPunch {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  action: "in" | "out";
  time: string;
}

export interface StaffDayMark {
  teacherId: string;
  date: string;
  status: StaffDayStatus;
}

export function keptMonthRange(now = new Date()) {
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previous = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return { previous, current };
}

export function isKeptMonth(value: string) {
  const { previous, current } = keptMonthRange();
  return value === previous || value === current;
}

export function isKeptDate(value: string) {
  return isKeptMonth(value.slice(0, 7));
}

export function currentDateValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function currentMonthValue() {
  return currentDateValue().slice(0, 7);
}

export function currentTimeLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function daysInMonth(month: string) {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText);
  if (!year || !monthIndex) return [];
  const count = new Date(year, monthIndex, 0).getDate();
  return Array.from({ length: count }, (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`);
}

export function feeTotal(fee: Pick<FeeRecord, "tuition" | "other" | "discount" | "lateFee">) {
  return fee.tuition + fee.other + fee.lateFee - fee.discount;
}

export function feeBalance(fee: FeeRecord) {
  return Math.max(feeTotal(fee) - fee.paid, 0);
}

export function deriveFeeStatus(fee: FeeRecord): FeeStatus {
  const total = feeTotal(fee);
  if (fee.paid <= 0) return "unpaid";
  if (fee.paid >= total) return "paid";
  return "partial";
}

export function listedFeeStatus(fee: FeeRecord | undefined): ListedFeeStatus {
  if (fee?.status === "paid" || fee?.status === "unpaid" || fee?.status === "pending") return fee.status;
  if (!fee) return "unpaid";
  const derived = deriveFeeStatus(fee);
  if (derived === "paid") return "paid";
  if (derived === "partial") return "pending";
  return "unpaid";
}

export function gradeFor(percent: number) {
  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B";
  if (percent >= 60) return "C";
  if (percent >= 50) return "D";
  return "F";
}

export function attendanceRate(rows: AttendanceMark[]) {
  if (rows.length === 0) return 0;
  const counted = rows.filter((row) => row.status === "present" || row.status === "late").length;
  return Math.round((counted / rows.length) * 100);
}

export interface ResultLine {
  studentId: string;
  studentName: string;
  className: string;
  obtained: number;
  total: number;
  percent: number;
  grade: string;
  position: number;
  subjects: { subject: string; obtained: number; total: number }[];
}

export function buildResults(marks: MarkRow[], examId: string, className?: string): ResultLine[] {
  const rows = marks.filter((mark) => mark.examId === examId && (!className || mark.className === className));
  const grouped = new Map<string, ResultLine>();
  for (const mark of rows) {
    const current = grouped.get(mark.studentId) ?? {
      studentId: mark.studentId,
      studentName: mark.studentName,
      className: mark.className,
      obtained: 0,
      total: 0,
      percent: 0,
      grade: "F",
      position: 0,
      subjects: [],
    };
    current.obtained += mark.obtained;
    current.total += mark.total;
    current.subjects.push({ subject: mark.subject, obtained: mark.obtained, total: mark.total });
    grouped.set(mark.studentId, current);
  }
  const list = [...grouped.values()]
    .map((line) => {
      const percent = line.total === 0 ? 0 : Math.round((line.obtained / line.total) * 10) / 10;
      return { ...line, percent, grade: gradeFor((line.obtained / Math.max(line.total, 1)) * 100) };
    })
    .sort((left, right) => right.percent - left.percent || right.obtained - left.obtained);
  return list.map((line, index) => ({ ...line, position: index + 1 }));
}

export function formatMoney(amount: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function matchesQuery(query: string, value: unknown) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return JSON.stringify(value).toLowerCase().includes(needle);
}

export function formatAdminDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1]} ${year}`;
}
