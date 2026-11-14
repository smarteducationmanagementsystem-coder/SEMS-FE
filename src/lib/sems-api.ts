import type { AttendanceMark, CampusLocation, ClassRoom, FeeRecord, HiringCandidate, Inquiry, Institution, ResultSheet, StaffDayMark, StaffDayStatus, StaffMember, StaffPunch, Student, Subject, Teacher } from "@/components/institution/campus-data";
import type { PortalAccess } from "@/components/institution/campus-nav";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export type AccountRole = "owner" | "teacher" | "staff" | "student";

export interface CampusProfile {
  ownerName: string;
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
  logoUrl: string;
  location1: CampusLocation;
  location2: CampusLocation;
  locationCheckEnabled: boolean;
  profileSaved?: boolean;
}

export interface AuthInstitution extends Institution, CampusProfile {
  code: string;
}

export interface AuthResult {
  token: string;
  role: AccountRole;
  actorId: string | null;
  institution: AuthInstitution;
  access: PortalAccess;
}

export class ApiError extends Error {}

interface DataResponse<T> {
  data: T;
}

async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Could not reach the server.");
  }
  const payload = (await response.json().catch(() => ({}))) as { message?: string };
  if (!response.ok) throw new ApiError(payload.message || "Request failed.");
  return payload as T;
}

function withoutIdentity<T extends { id?: string; institutionCode?: string }>(person: T) {
  const { id, institutionCode, ...fields } = person;
  void id;
  void institutionCode;
  return fields;
}

export function isPersistedId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function signupInstitution(body: { ownerName: string; name: string; city: string; type: Institution["type"]; email: string; password: string }) {
  return request<AuthResult>("/auth/signup", { method: "POST", body });
}

export function loginInstitution(body: { email: string; password: string }) {
  return request<AuthResult>("/auth/login", { method: "POST", body });
}

export interface PublicInstitution {
  id: string;
  name: string;
  city: string;
  type: Institution["type"];
}

export async function listCities() {
  const result = await request<DataResponse<string[]>>("/directory/cities");
  return result.data;
}

export async function listInstitutionsByPlace(city: string, type: Institution["type"]) {
  const params = new URLSearchParams({ city, type });
  const result = await request<DataResponse<PublicInstitution[]>>(`/directory/institutions?${params.toString()}`);
  return result.data;
}

export function loginStudent(body: { username: string; password: string; institutionId: string }) {
  return request<AuthResult>("/auth/student-login", { method: "POST", body });
}

export function loginTeacher(body: { email: string; password: string; institutionId: string; latitude?: number; longitude?: number }) {
  return request<AuthResult>("/auth/teacher-login", { method: "POST", body });
}

export async function saveInstitutionSettings(token: string, body: Omit<CampusProfile, "logoUrl" | "profileSaved">) {
  const result = await request<DataResponse<CampusProfile>>("/institution", { method: "PUT", token, body });
  return result.data;
}

export async function uploadInstitutionLogo(token: string, file: File) {
  const body = new FormData();
  body.append("logo", file);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/institution/logo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  } catch {
    throw new ApiError("Could not reach the server.");
  }
  const payload = (await response.json().catch(() => ({}))) as { message?: string; data?: CampusProfile };
  if (!response.ok || !payload.data) throw new ApiError(payload.message || "Could not store the logo.");
  return payload.data;
}

export async function deleteInstitutionLogo(token: string) {
  const result = await request<DataResponse<CampusProfile>>("/institution/logo", { method: "DELETE", token });
  return result.data;
}

export function readDeviceLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ error: "Enable location to login your portal." });
  }
  return new Promise<{ latitude: number; longitude: number } | { error: string }>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve({ error: "Enable location to login your portal." }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function currentAccount(token: string) {
  return request<Omit<AuthResult, "token">>("/auth/me", { token });
}

export async function listStudents(token: string) {
  const result = await request<DataResponse<Student[]>>("/students", { token });
  return result.data;
}

export async function saveStudentRecord(token: string, student: Student) {
  const body = withoutIdentity(student);
  const result = isPersistedId(student.id)
    ? await request<DataResponse<Student>>(`/students/${student.id}`, { method: "PUT", token, body })
    : await request<DataResponse<Student>>("/students", { method: "POST", token, body });
  return result.data;
}

export function deleteStudentRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/students/${id}`, { method: "DELETE", token });
}

export async function listTeachers(token: string) {
  const result = await request<DataResponse<Teacher[]>>("/teachers", { token });
  return result.data;
}

export async function saveTeacherRecord(token: string, teacher: Teacher) {
  const body = withoutIdentity(teacher);
  const result = isPersistedId(teacher.id)
    ? await request<DataResponse<Teacher>>(`/teachers/${teacher.id}`, { method: "PUT", token, body })
    : await request<DataResponse<Teacher>>("/teachers", { method: "POST", token, body });
  return result.data;
}

export function deleteTeacherRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/teachers/${id}`, { method: "DELETE", token });
}

export async function listStaff(token: string) {
  const result = await request<DataResponse<StaffMember[]>>("/staff", { token });
  return result.data;
}

export async function saveStaffRecord(token: string, member: StaffMember) {
  const body = withoutIdentity(member);
  const result = isPersistedId(member.id)
    ? await request<DataResponse<StaffMember>>(`/staff/${member.id}`, { method: "PUT", token, body })
    : await request<DataResponse<StaffMember>>("/staff", { method: "POST", token, body });
  return result.data;
}

export function deleteStaffRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/staff/${id}`, { method: "DELETE", token });
}

export async function savePermissions(token: string, access: PortalAccess) {
  const result = await request<DataResponse<PortalAccess>>("/access", { method: "PUT", token, body: access });
  return result.data;
}

export async function listStudentQueries(token: string) {
  const result = await request<DataResponse<Inquiry[]>>("/queries", { token });
  return result.data;
}

export async function createStudentQuery(token: string, body: { subject: string; message: string }) {
  const result = await request<DataResponse<Inquiry>>("/queries", { method: "POST", token, body });
  return result.data;
}

export async function markStudentQueryRead(token: string, id: string) {
  const result = await request<DataResponse<Inquiry>>(`/queries/${id}/read`, { method: "POST", token });
  return result.data;
}

export async function listClasses(token: string) {
  const result = await request<DataResponse<ClassRoom[]>>("/classes", { token });
  return result.data;
}

export async function saveClassRecord(token: string, room: ClassRoom) {
  const body = withoutIdentity(room);
  const result = isPersistedId(room.id)
    ? await request<DataResponse<ClassRoom>>(`/classes/${room.id}`, { method: "PUT", token, body })
    : await request<DataResponse<ClassRoom>>("/classes", { method: "POST", token, body });
  return result.data;
}

export function deleteClassRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/classes/${id}`, { method: "DELETE", token });
}

export async function listSubjects(token: string) {
  const result = await request<DataResponse<Subject[]>>("/subjects", { token });
  return result.data;
}

export async function saveSubjectRecord(token: string, subject: Subject) {
  const body = withoutIdentity(subject);
  const result = isPersistedId(subject.id)
    ? await request<DataResponse<Subject>>(`/subjects/${subject.id}`, { method: "PUT", token, body })
    : await request<DataResponse<Subject>>("/subjects", { method: "POST", token, body });
  return result.data;
}

export function deleteSubjectRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/subjects/${id}`, { method: "DELETE", token });
}

export async function loadCatalog(token: string) {
  const [classes, subjects] = await Promise.all([listClasses(token), listSubjects(token)]);
  return { classes, subjects };
}

export async function listHiring(token: string) {
  const result = await request<DataResponse<HiringCandidate[]>>("/hiring", { token });
  return result.data;
}

export async function saveHiringRecord(token: string, candidate: HiringCandidate) {
  const body = withoutIdentity(candidate);
  const result = isPersistedId(candidate.id)
    ? await request<DataResponse<HiringCandidate>>(`/hiring/${candidate.id}`, { method: "PUT", token, body })
    : await request<DataResponse<HiringCandidate>>("/hiring", { method: "POST", token, body });
  return result.data;
}

export function deleteHiringRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/hiring/${id}`, { method: "DELETE", token });
}

export async function listAttendance(token: string) {
  const result = await request<DataResponse<AttendanceMark[]>>("/attendance", { token });
  return result.data;
}

export async function saveAttendanceRecords(token: string, rows: Array<Omit<AttendanceMark, "id">>) {
  const result = await request<DataResponse<AttendanceMark[]>>("/attendance", { method: "POST", token, body: { rows } });
  return result.data;
}

export async function loadDirectory(token: string, role: AccountRole) {
  const attendance = await listAttendance(token);
  if (role === "student") {
    return { students: await listStudents(token), teachers: [] as Teacher[], staff: [] as StaffMember[], hiring: [] as HiringCandidate[], attendance };
  }
  const [students, teachers, staff, hiring] = await Promise.all([listStudents(token), listTeachers(token), listStaff(token), listHiring(token)]);
  return { students, teachers, staff, hiring, attendance };
}

export interface StaffAttendanceRow {
  id: string;
  personId: string;
  personName: string;
  personKind: "teacher" | "staff";
  date: string;
  inTime: string;
  outTime: string;
  status: StaffDayStatus | "";
}

export async function listStaffAttendance(token: string) {
  const result = await request<DataResponse<StaffAttendanceRow[]>>("/staff-attendance", { token });
  return result.data;
}

export async function saveStaffPunch(token: string, body: { personId: string; personName: string; personKind: "teacher" | "staff"; date: string; action: "in" | "out"; time: string }) {
  const result = await request<DataResponse<StaffAttendanceRow>>("/staff-attendance/punch", { method: "POST", token, body });
  return result.data;
}

export async function saveStaffStatus(token: string, body: { personId: string; personName: string; personKind: "teacher" | "staff"; date: string; status: StaffDayStatus | "" }) {
  const result = await request<DataResponse<StaffAttendanceRow>>("/staff-attendance/status", { method: "POST", token, body });
  return result.data;
}

export function staffPunchesFrom(rows: StaffAttendanceRow[]): StaffPunch[] {
  return rows.flatMap((row) => {
    const punches: StaffPunch[] = [];
    if (row.inTime) punches.push({ id: `${row.id}-in`, teacherId: row.personId, teacherName: row.personName, date: row.date, action: "in", time: row.inTime });
    if (row.outTime) punches.push({ id: `${row.id}-out`, teacherId: row.personId, teacherName: row.personName, date: row.date, action: "out", time: row.outTime });
    return punches;
  });
}

export function staffMarksFrom(rows: StaffAttendanceRow[]): StaffDayMark[] {
  return rows.filter((row) => row.status).map((row) => ({ teacherId: row.personId, date: row.date, status: row.status as StaffDayStatus }));
}

export async function listFees(token: string) {
  const result = await request<DataResponse<FeeRecord[]>>("/fees", { token });
  return result.data;
}

export async function saveFeeRecords(token: string, records: FeeRecord[]) {
  const result = await request<DataResponse<FeeRecord[]>>("/fees", { method: "POST", token, body: { records } });
  return result.data;
}

export async function listResultSheets(token: string) {
  const result = await request<DataResponse<ResultSheet[]>>("/result-sheets", { token });
  return result.data;
}

export async function saveResultSheetRecord(token: string, sheet: ResultSheet) {
  const result = await request<DataResponse<ResultSheet>>("/result-sheets", { method: "PUT", token, body: sheet });
  return result.data;
}

export function deleteResultSheetRecord(token: string, id: string) {
  return request<{ ok: boolean }>(`/result-sheets/${encodeURIComponent(id)}`, { method: "DELETE", token });
}

export interface ResultImageRecord {
  id: string;
  className: string;
  section: string;
  month: string;
  imageUrl: string;
}

export async function listResultImages(token: string) {
  const result = await request<DataResponse<ResultImageRecord[]>>("/result-images", { token });
  return result.data;
}

export async function uploadResultImage(token: string, className: string, section: string, file: File) {
  const body = new FormData();
  body.append("className", className);
  body.append("section", section);
  body.append("image", file);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/result-images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  } catch {
    throw new ApiError("Could not reach the server.");
  }
  const payload = (await response.json().catch(() => ({}))) as { message?: string; data?: ResultImageRecord };
  if (!response.ok || !payload.data) throw new ApiError(payload.message || "Could not store the result image.");
  return payload.data;
}

export async function loadLedger(token: string) {
  const [fees, resultSheets, staffRows, inquiries] = await Promise.all([listFees(token), listResultSheets(token), listStaffAttendance(token), listStudentQueries(token)]);
  return { fees, resultSheets, staffPunches: staffPunchesFrom(staffRows), staffDayMarks: staffMarksFrom(staffRows), inquiries };
}
