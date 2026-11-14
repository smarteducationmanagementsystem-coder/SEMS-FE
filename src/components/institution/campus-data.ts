export type RoleId = "super_admin" | "institution_admin" | "teacher" | "accountant" | "student" | "parent";
export type FeeStatus = "paid" | "unpaid" | "partial";
export type ListedFeeStatus = "paid" | "unpaid" | "pending";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";
export type PersonStatus = "active" | "inactive" | "on leave";

export const todayIso = "2026-11-06";

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
  institution_admin: { label: "Institution Admin", name: "Omar Farooq", title: "Principal, Northline Academy" },
  teacher: { label: "Teacher", name: "Nadia Hussain", title: "Mathematics · Grade 8" },
  accountant: { label: "Accountant", name: "Bilal Khan", title: "Accounts office" },
  student: { label: "Student", name: "Ayaan Malik", title: "Grade 8 · Section A" },
  parent: { label: "Parent", name: "Hina Qureshi", title: "Parent of Ayaan and Zara" },
};

export const viewerScope = {
  teacherClass: "Grade 8",
  studentId: "stu-ayaan",
  parentStudentIds: ["stu-ayaan", "stu-zara"],
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

export const studentsSeed: Student[] = [
  { id: "stu-ayaan", admissionNo: "NA-24018", name: "Ayaan Malik", gender: "Male", className: "Grade 8", section: "A", session: "2026–27", guardian: "Hina Qureshi", guardianPhone: "+92 321 440 1182", email: "ayaan.malik@student.northline.edu", phone: "+92 300 110 2201", address: "House 14, Block C, DHA Phase 5, Lahore", dob: "2012-04-11", status: "active", enrolledOn: "2024-08-12" },
  { id: "stu-zara", admissionNo: "NA-25102", name: "Zara Qureshi", gender: "Female", className: "Grade 5", section: "B", session: "2026–27", guardian: "Hina Qureshi", guardianPhone: "+92 321 440 1182", email: "zara.qureshi@student.northline.edu", phone: "+92 300 110 2202", address: "House 14, Block C, DHA Phase 5, Lahore", dob: "2015-09-02", status: "active", enrolledOn: "2025-08-18" },
  { id: "stu-ibrahim", admissionNo: "NA-24022", name: "Ibrahim Shah", gender: "Male", className: "Grade 8", section: "A", session: "2026–27", guardian: "Farah Shah", guardianPhone: "+92 333 510 0091", email: "ibrahim.shah@student.northline.edu", phone: "+92 300 110 2203", address: "22-B, Gulberg III, Lahore", dob: "2012-01-19", status: "active", enrolledOn: "2024-08-12" },
  { id: "stu-meher", admissionNo: "NA-22091", name: "Meher Khan", gender: "Female", className: "Grade 10", section: "A", session: "2026–27", guardian: "Tariq Khan", guardianPhone: "+92 300 778 4410", email: "meher.khan@student.northline.edu", phone: "+92 300 110 2204", address: "9 Canal View, Lahore", dob: "2010-07-23", status: "active", enrolledOn: "2022-08-15" },
  { id: "stu-hassan", admissionNo: "NA-23044", name: "Hassan Raza", gender: "Male", className: "Grade 9", section: "B", session: "2026–27", guardian: "Saima Raza", guardianPhone: "+92 345 220 1188", email: "hassan.raza@student.northline.edu", phone: "+92 300 110 2205", address: "Model Town, Block H, Lahore", dob: "2011-11-08", status: "active", enrolledOn: "2023-08-14" },
  { id: "stu-ayesha", admissionNo: "NA-25016", name: "Ayesha Noor", gender: "Female", className: "Grade 7", section: "A", session: "2026–27", guardian: "Noor Fatima", guardianPhone: "+92 312 660 4412", email: "ayesha.noor@student.northline.edu", phone: "+92 300 110 2206", address: "Johar Town, Lahore", dob: "2013-03-30", status: "active", enrolledOn: "2025-08-18" },
  { id: "stu-daniyal", admissionNo: "NA-24061", name: "Daniyal Ahmed", gender: "Male", className: "Grade 8", section: "B", session: "2026–27", guardian: "Ahmed Bilal", guardianPhone: "+92 321 900 2211", email: "daniyal.ahmed@student.northline.edu", phone: "+92 300 110 2207", address: "Wapda Town, Lahore", dob: "2012-06-14", status: "active", enrolledOn: "2024-08-12" },
  { id: "stu-hania", admissionNo: "NA-26003", name: "Hania Tariq", gender: "Female", className: "Grade 6", section: "A", session: "2026–27", guardian: "Tariq Mehmood", guardianPhone: "+92 333 118 7760", email: "hania.tariq@student.northline.edu", phone: "+92 300 110 2208", address: "Askari 11, Lahore", dob: "2014-12-01", status: "active", enrolledOn: "2026-08-10" },
  { id: "stu-saad", admissionNo: "NA-22077", name: "Saad Iqbal", gender: "Male", className: "Grade 10", section: "B", session: "2026–27", guardian: "Iqbal Hussain", guardianPhone: "+92 300 441 9088", email: "saad.iqbal@student.northline.edu", phone: "+92 300 110 2209", address: "Bahria Town, Lahore", dob: "2010-02-17", status: "active", enrolledOn: "2022-08-15" },
  { id: "stu-fatima", admissionNo: "NA-23019", name: "Fatima Zahra", gender: "Female", className: "Grade 9", section: "A", session: "2026–27", guardian: "Zahra Bano", guardianPhone: "+92 345 772 3301", email: "fatima.zahra@student.northline.edu", phone: "+92 300 110 2210", address: "Faisal Town, Lahore", dob: "2011-08-25", status: "inactive", enrolledOn: "2023-08-14" },
];

export const teachersSeed: Teacher[] = [
  { id: "tch-nadia", employeeNo: "T-014", name: "Nadia Hussain", subject: "Mathematics", classes: "Grade 8", phone: "+92 300 700 1101", email: "nadia.hussain@northline.edu", qualification: "MSc Mathematics", joinedOn: "2019-08-01", status: "active" },
  { id: "tch-kamran", employeeNo: "T-021", name: "Kamran Ali", subject: "Physics", classes: "Grade 9, Grade 10", phone: "+92 300 700 1102", email: "kamran.ali@northline.edu", qualification: "MPhil Physics", joinedOn: "2018-04-16", status: "active" },
  { id: "tch-sana", employeeNo: "T-033", name: "Sana Javed", subject: "English", classes: "Grade 5, Grade 6, Grade 7", phone: "+92 300 700 1103", email: "sana.javed@northline.edu", qualification: "MA English", joinedOn: "2021-01-11", status: "active" },
  { id: "tch-usman", employeeNo: "T-041", name: "Usman Ghani", subject: "Computer Science", classes: "Grade 8, Grade 9", phone: "+92 300 700 1104", email: "usman.ghani@northline.edu", qualification: "BS Computer Science", joinedOn: "2022-09-01", status: "active" },
  { id: "tch-rabia", employeeNo: "T-018", name: "Rabia Siddiqui", subject: "Urdu", classes: "Grade 6, Grade 8, Grade 10", phone: "+92 300 700 1105", email: "rabia.siddiqui@northline.edu", qualification: "MA Urdu", joinedOn: "2017-08-20", status: "on leave" },
  { id: "tch-farhan", employeeNo: "T-027", name: "Farhan Adeel", subject: "Chemistry", classes: "Grade 10", phone: "+92 300 700 1106", email: "farhan.adeel@northline.edu", qualification: "MSc Chemistry", joinedOn: "2020-03-02", status: "active" },
];

export const staffSeed: StaffMember[] = [
  { id: "stf-bilal", employeeNo: "S-008", name: "Bilal Khan", role: "Accountant", department: "Accounts", phone: "+92 300 800 2101", email: "bilal.khan@northline.edu", joinedOn: "2018-06-01", status: "active" },
  { id: "stf-lubna", employeeNo: "S-019", name: "Lubna Sheikh", role: "Front office", department: "Administration", phone: "+92 300 800 2102", email: "lubna.sheikh@northline.edu", joinedOn: "2021-11-15", status: "active" },
  { id: "stf-imran", employeeNo: "S-022", name: "Imran Yousaf", role: "Lab assistant", department: "Science", phone: "+92 300 800 2103", email: "imran.yousaf@northline.edu", joinedOn: "2019-02-04", status: "active" },
  { id: "stf-nida", employeeNo: "S-031", name: "Nida Baig", role: "Librarian", department: "Library", phone: "+92 300 800 2104", email: "nida.baig@northline.edu", joinedOn: "2023-01-09", status: "on leave" },
];

export const classesSeed: ClassRoom[] = [
  { id: "cls-5a", name: "Grade 5", section: "A", session: "2026–27", teacher: "Sana Javed", room: "B-12" },
  { id: "cls-5b", name: "Grade 5", section: "B", session: "2026–27", teacher: "Sana Javed", room: "B-13" },
  { id: "cls-6a", name: "Grade 6", section: "A", session: "2026–27", teacher: "Rabia Siddiqui", room: "B-14" },
  { id: "cls-7a", name: "Grade 7", section: "A", session: "2026–27", teacher: "Sana Javed", room: "C-02" },
  { id: "cls-8a", name: "Grade 8", section: "A", session: "2026–27", teacher: "Nadia Hussain", room: "C-08" },
  { id: "cls-8b", name: "Grade 8", section: "B", session: "2026–27", teacher: "Nadia Hussain", room: "C-09" },
  { id: "cls-9a", name: "Grade 9", section: "A", session: "2026–27", teacher: "Kamran Ali", room: "D-01" },
  { id: "cls-9b", name: "Grade 9", section: "B", session: "2026–27", teacher: "Kamran Ali", room: "D-02" },
  { id: "cls-10a", name: "Grade 10", section: "A", session: "2026–27", teacher: "Farhan Adeel", room: "D-06" },
  { id: "cls-10b", name: "Grade 10", section: "B", session: "2026–27", teacher: "Farhan Adeel", room: "D-07" },
];

export const subjectsSeed: Subject[] = [
  { id: "sub-math-8", name: "Mathematics", code: "MTH-8", className: "Grade 8", teacher: "Nadia Hussain", weeklyPeriods: 6 },
  { id: "sub-eng-8", name: "English", code: "ENG-8", className: "Grade 8", teacher: "Sana Javed", weeklyPeriods: 5 },
  { id: "sub-sci-8", name: "Science", code: "SCI-8", className: "Grade 8", teacher: "Kamran Ali", weeklyPeriods: 5 },
  { id: "sub-urd-8", name: "Urdu", code: "URD-8", className: "Grade 8", teacher: "Rabia Siddiqui", weeklyPeriods: 4 },
  { id: "sub-cs-8", name: "Computer Science", code: "CS-8", className: "Grade 8", teacher: "Usman Ghani", weeklyPeriods: 3 },
  { id: "sub-phy-10", name: "Physics", code: "PHY-10", className: "Grade 10", teacher: "Kamran Ali", weeklyPeriods: 6 },
  { id: "sub-chem-10", name: "Chemistry", code: "CHM-10", className: "Grade 10", teacher: "Farhan Adeel", weeklyPeriods: 6 },
  { id: "sub-eng-5", name: "English", code: "ENG-5", className: "Grade 5", teacher: "Sana Javed", weeklyPeriods: 6 },
];

export const sessionsSeed: AcademicSession[] = [
  { id: "ses-current", name: "2026–27", start: "2026-08-10", end: "2027-05-30", status: "active" },
  { id: "ses-next", name: "2027–28", start: "2027-08-09", end: "2028-05-28", status: "upcoming" },
  { id: "ses-prev", name: "2025–26", start: "2025-08-11", end: "2026-05-29", status: "closed" },
];

export const feeStructuresSeed: FeeStructure[] = [
  { id: "fs-5", className: "Grade 5", tuition: 8500, transport: 2500, lab: 0 },
  { id: "fs-6", className: "Grade 6", tuition: 9000, transport: 2500, lab: 500 },
  { id: "fs-7", className: "Grade 7", tuition: 9800, transport: 2500, lab: 700 },
  { id: "fs-8", className: "Grade 8", tuition: 11000, transport: 2500, lab: 800 },
  { id: "fs-9", className: "Grade 9", tuition: 12500, transport: 2800, lab: 1200 },
  { id: "fs-10", className: "Grade 10", tuition: 14000, transport: 2800, lab: 1500 },
];

function structureFor(className: string) {
  return feeStructuresSeed.find((item) => item.className === className) ?? feeStructuresSeed[3];
}

const feeMonths = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];

export const feesSeed: FeeRecord[] = studentsSeed.flatMap((student, studentIndex) => {
  const structure = structureFor(student.className);
  return feeMonths.map((month, monthIndex) => {
    const discount = student.id === "stu-meher" && month === "2026-11" ? 2000 : 0;
    const lateFee = studentIndex % 4 === 0 && monthIndex === feeMonths.length - 1 ? 500 : 0;
    const total = structure.tuition + structure.transport + structure.lab + lateFee - discount;
    const cycle = (studentIndex + monthIndex) % 5;
    const paid = student.status === "inactive" ? 0 : cycle === 0 ? Math.round(total * 0.4) : total;
    return {
      id: `fee-${student.id}-${month}`,
      challanNo: `CH-${month.replace("-", "")}-${student.admissionNo}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      month,
      tuition: structure.tuition,
      other: structure.transport + structure.lab,
      discount,
      lateFee,
      paid,
      method: paid === 0 ? "—" : paid < total ? "Cash" : monthIndex % 2 === 0 ? "Bank transfer" : "Cash",
      dueDate: `${month}-10`,
    };
  });
});

const attendanceDates = ["2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];

function statusFor(seed: number): AttendanceStatus {
  if (seed % 11 === 0) return "absent";
  if (seed % 11 === 1) return "late";
  if (seed % 11 === 2) return "leave";
  return "present";
}

export const attendanceSeed: AttendanceMark[] = [
  ...studentsSeed.filter((student) => student.status === "active").flatMap((student, index) =>
    attendanceDates.map((date, day) => ({
      id: `att-${student.id}-${date}`,
      date,
      personId: student.id,
      personName: student.name,
      kind: "student" as const,
      className: student.className,
      status: statusFor(index * 3 + day + 4),
    })),
  ),
  ...staffSeed.flatMap((member, index) =>
    attendanceDates.map((date, day) => ({
      id: `att-${member.id}-${date}`,
      date,
      personId: member.id,
      personName: member.name,
      kind: "staff" as const,
      className: member.department,
      status: statusFor(index * 5 + day + 2),
    })),
  ),
  ...teachersSeed.flatMap((member, index) =>
    attendanceDates.map((date, day) => ({
      id: `att-${member.id}-${date}`,
      date,
      personId: member.id,
      personName: member.name,
      kind: "staff" as const,
      className: member.subject,
      status: member.status === "on leave" && day > 5 ? "leave" : statusFor(index * 4 + day + 6),
    })),
  ),
];

export const examsSeed: Exam[] = [
  { id: "exam-g8-mid", name: "Mid Term", session: "2026–27", className: "Grade 8", startDate: "2026-11-16", endDate: "2026-11-22", status: "ongoing" },
  { id: "exam-g10-mid", name: "Mid Term", session: "2026–27", className: "Grade 10", startDate: "2026-10-20", endDate: "2026-10-27", status: "published" },
  { id: "exam-g5-test", name: "Monthly Test", session: "2026–27", className: "Grade 5", startDate: "2026-11-24", endDate: "2026-11-25", status: "scheduled" },
];

const grade8Papers = [
  { subject: "Mathematics", total: 100 },
  { subject: "English", total: 100 },
  { subject: "Science", total: 75 },
  { subject: "Urdu", total: 75 },
];

const grade10Papers = [
  { subject: "Mathematics", total: 100 },
  { subject: "Physics", total: 100 },
  { subject: "Chemistry", total: 100 },
  { subject: "English", total: 100 },
];

function marksFor(students: Student[], exam: Exam, papers: { subject: string; total: number }[]): MarkRow[] {
  return students
    .filter((student) => student.className === exam.className && student.status === "active")
    .flatMap((student, studentIndex) =>
      papers.map((paper, paperIndex) => {
        const ratio = 0.62 + ((studentIndex * 5 + paperIndex * 3) % 7) * 0.05;
        return {
          id: `mk-${exam.id}-${student.id}-${paper.subject}`,
          examId: exam.id,
          examName: exam.name,
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          subject: paper.subject,
          total: paper.total,
          obtained: Math.min(paper.total, Math.round(paper.total * ratio)),
        };
      }),
    );
}

export const marksSeed: MarkRow[] = [
  ...marksFor(studentsSeed, examsSeed[0], grade8Papers),
  ...marksFor(studentsSeed, examsSeed[1], grade10Papers),
];

export const inquiriesSeed: Inquiry[] = [
  { id: "inq-1", name: "Hira Latif", email: "hira.latif@crescent.edu", institution: "Crescent College", message: "We need parent access and class-wise result cards before the winter exams.", status: "new", date: "2026-11-04" },
  { id: "inq-2", name: "Adeel Rahman", email: "adeel@horizon.example", institution: "Horizon School", message: "Can the accountant generate November challans for 900 students in one pass?", status: "replied", date: "2026-11-01" },
  { id: "inq-3", name: "Mariam Noor", email: "mariam@alnoor.example", institution: "Al-Noor Academy", message: "Looking at the Basic plan for a single campus of 280 students.", status: "new", date: "2026-10-28" },
];

export const noticesSeed: Notice[] = [
  { id: "nt-1", title: "November fee reminder", body: "Challans for November are due on 10 November. Partial payments stay open until the balance is cleared.", audience: "Parents", date: "2026-11-05", read: false },
  { id: "nt-2", title: "Grade 10 mid term published", body: "Result cards for Grade 10 Mid Term are ready to print. Positions are calculated from total marks.", audience: "Teachers", date: "2026-11-03", read: false },
  { id: "nt-3", title: "Attendance below 80%", body: "Two Grade 8 students are under the monthly attendance threshold. Review the class report before the parent meeting.", audience: "Institution Admin", date: "2026-11-06", read: true },
  { id: "nt-4", title: "Staff leave", body: "Rabia Siddiqui is on leave. Urdu periods for Grade 8 are covered by the substitute timetable.", audience: "Staff", date: "2026-11-02", read: false },
];

export const institutionsSeed: Institution[] = [
  { id: "ins-northline", name: "Northline Academy", city: "Lahore", type: "School", students: 1284, plan: "Professional", status: "active" },
  { id: "ins-crescent", name: "Crescent College", city: "Karachi", type: "College", students: 2140, plan: "Enterprise", status: "active" },
  { id: "ins-horizon", name: "Horizon School", city: "Islamabad", type: "School", students: 860, plan: "Professional", status: "active" },
  { id: "ins-alnoor", name: "Al-Noor Academy", city: "Faisalabad", type: "Academy", students: 280, plan: "Basic", status: "trial" },
];

export const settingsSeed: CampusSettings = {
  institutionName: "Northline Academy",
  tagline: "A Northline education",
  email: "office@northline.edu",
  phone: "+92 42 111 220 330",
  city: "Lahore",
  address: "12-A, Canal Bank Road, Lahore",
  session: "2026–27",
  lateFee: 500,
  reminderDays: 3,
  feeReminders: true,
  resultAlerts: true,
  attendanceAlerts: true,
  ownerName: "Sara Ahmed",
  logoUrl: "",
  location1: { ...emptyCampusLocation },
  location2: { ...emptyCampusLocation },
  locationCheckEnabled: false,
};

export const demoCampusPassword = "campus123";

export function settingsForInstitution(institution: Pick<Institution, "name" | "city">, email?: string, ownerName = ""): CampusSettings {
  const slug = institution.name.toLowerCase().replace(/[^a-z0-9]+/g, "") || "campus";
  return {
    institutionName: institution.name,
    tagline: institution.name,
    email: email ?? `office@${slug}.edu`,
    phone: "",
    city: institution.city,
    address: institution.city,
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

/** Demo sign-in for each campus. A new signup replaces the entry for that institution. */
export const institutionAccountsSeed: Record<string, { email: string; password: string }> = {
  "ins-northline": { email: settingsSeed.email, password: demoCampusPassword },
  "ins-crescent": { email: "office@crescent.edu", password: demoCampusPassword },
  "ins-horizon": { email: "office@horizon.edu", password: demoCampusPassword },
  "ins-alnoor": { email: "office@alnoor.edu", password: demoCampusPassword },
};

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

export const collectionSeries = [
  { month: "Jun", collected: 3_120_000 },
  { month: "Jul", collected: 2_840_000 },
  { month: "Aug", collected: 4_260_000 },
  { month: "Sep", collected: 3_980_000 },
  { month: "Oct", collected: 4_410_000 },
  { month: "Nov", collected: 1_860_000 },
];

export const attendanceTrend = [
  { label: "W1", value: 91 },
  { label: "W2", value: 93 },
  { label: "W3", value: 89 },
  { label: "W4", value: 94 },
  { label: "W5", value: 92 },
  { label: "W6", value: 95 },
];

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
