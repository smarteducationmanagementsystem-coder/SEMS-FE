import { ApiError } from "@/lib/sems-api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface PlatformStats {
  month: string;
  institutions: number;
  students: number;
  people: number;
  pendingPayment: number;
  paidPayment: number;
  revenue: number;
}

export interface PlatformInstitution {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  type: "School" | "College" | "Academy";
  students: number;
  teachers: number;
  staff: number;
  joinedAt: string | null;
}

export interface PlatformPaymentRow {
  id: string;
  name: string;
  type: PlatformInstitution["type"];
  city: string;
  joinedAt: string | null;
  status: "paid" | "unpaid";
}

export interface PlatformContactMessage {
  id: string;
  name: string;
  email: string;
  institution: string;
  message: string;
  createdAt: string | null;
}

export interface PlatformPayments {
  month: string;
  cities: string[];
  rows: PlatformPaymentRow[];
}

export interface PlatformPendingRow {
  id: string;
  name: string;
  type: PlatformInstitution["type"];
  phone: string;
  joinedAt: string | null;
}

export interface PlatformRecipient {
  id: string;
  name: string;
  type: PlatformInstitution["type"];
  email: string;
}

export interface PlatformEmailResult {
  sent: number;
  failed: string[];
}

export function formatJoined(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}

async function request<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/platformadmin${path}`, {
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

export async function loginPlatformAdmin(email: string, password: string) {
  const result = await request<{ data: { token: string } }>("/login", { method: "POST", body: { email, password } });
  return result.data.token;
}

export async function loadPlatformStats(token: string) {
  const result = await request<{ data: PlatformStats }>("/dashboard", { token });
  return result.data;
}

export interface PlatformStorageUsage {
  databaseBytes: number;
  cloudinaryBytes: number | null;
  measuredAt: string | null;
  label: string;
}

export async function loadPlatformInstitutions(token: string, type: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const result = await request<{ data: PlatformInstitution[] }>(`/institutions${query}`, { token });
  return result.data;
}

export async function savePlatformInstitution(token: string, id: string, body: Pick<PlatformInstitution, "name" | "city" | "phone" | "email" | "type">) {
  const result = await request<{ data: PlatformInstitution }>(`/institutions/${id}`, { method: "PUT", token, body });
  return result.data;
}

export async function loadPlatformStorage(token: string, id: string) {
  const result = await request<{ data: PlatformStorageUsage }>(`/institutions/${id}/storage`, { token });
  return result.data;
}

export function deletePlatformInstitution(token: string, id: string) {
  return request<{ ok: boolean }>(`/institutions/${id}`, { method: "DELETE", token });
}

export async function loadPlatformPayments(token: string, type: string, city: string, month: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (city) params.set("city", city);
  if (month) params.set("month", month);
  const queryText = params.toString();
  const query = queryText ? `?${queryText}` : "";
  const result = await request<{ data: PlatformPayments }>(`/payments${query}`, { token });
  return result.data;
}

export async function markPlatformPayment(token: string, id: string, status: "paid" | "unpaid", month: string) {
  const result = await request<{ data: { id: string; status: "paid" | "unpaid"; month: string } }>(`/payments/${id}`, {
    method: "PUT",
    token,
    body: { status, month },
  });
  return result.data;
}

export async function deletePlatformPayments(token: string, from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const result = await request<{ data: { deleted: number } }>(`/payments?${params.toString()}`, { method: "DELETE", token });
  return result.data;
}

export async function loadPlatformAccount(token: string) {
  const result = await request<{ data: { email: string } }>("/settings", { token });
  return result.data;
}

export async function savePlatformAccount(token: string, body: { email: string; password: string; currentPassword: string }) {
  const result = await request<{ data: { email: string } }>("/settings", { method: "PUT", token, body });
  return result.data;
}

export async function loadPendingPayments(token: string) {
  const result = await request<{ data: { month: string; rows: PlatformPendingRow[] } }>("/pending-payments", { token });
  return result.data;
}

export async function loadEmailRecipients(token: string, type: string) {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const result = await request<{ data: PlatformRecipient[] }>(`/email/recipients${query}`, { token });
  return result.data;
}

export async function submitContactMessage(body: { name: string; email: string; institution?: string; message: string }) {
  const result = await request<{ data: { id: string } }>("/contact", { method: "POST", body });
  return result.data;
}

export interface PricingPlan {
  name: string;
  audience: string;
  price: string;
  period: string;
  points: string[];
  featured: boolean;
  buttonLabel: string;
}

export interface PricingPayment {
  accountName: string;
  accountNumber: string;
  detail: string;
}

export interface PlatformPricing {
  plans: PricingPlan[];
  payment: PricingPayment;
}

export interface PlatformFooter {
  blurb: string;
  email: string;
  phone: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
}

export async function loadPublicFooter() {
  const result = await request<{ data: PlatformFooter }>("/footer");
  return result.data;
}

export async function savePlatformFooter(token: string, body: PlatformFooter) {
  const result = await request<{ data: PlatformFooter }>("/footer", { method: "PUT", token, body });
  return result.data;
}

export interface PlatformContactPage {
  email: string;
  whatsapp: string;
  phone: string;
  hours: string;
  city: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  placeholder: boolean;
}

export async function loadPublicContactPage() {
  const result = await request<{ data: PlatformContactPage }>("/contact-page");
  return result.data;
}

export async function savePlatformContactPage(token: string, body: Omit<PlatformContactPage, "placeholder">) {
  const result = await request<{ data: PlatformContactPage }>("/contact-page", { method: "PUT", token, body });
  return result.data;
}

export async function loadPublicPricing() {
  const result = await request<{ data: PlatformPricing }>("/pricing");
  return result.data;
}

export async function savePlatformPricing(token: string, body: PlatformPricing) {
  const result = await request<{ data: PlatformPricing }>("/pricing", { method: "PUT", token, body });
  return result.data;
}

export async function loadContactMessages(token: string) {
  const result = await request<{ data: PlatformContactMessage[] }>("/contact", { token });
  return result.data;
}

export type LandingSlot = "signupimage" | "loginimage" | "logoimage" | "aboutimage";

export interface PlatformLanding {
  signupImage: string;
  loginImage: string;
  logoImage: string;
  aboutImage: string;
}

export async function loadPublicLanding() {
  const result = await request<{ data: PlatformLanding }>("/landing");
  return result.data;
}

export async function uploadPlatformLandingImage(token: string, slot: LandingSlot, file: File) {
  const body = new FormData();
  body.append("image", file);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/platformadmin/landing/${slot}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
  } catch {
    throw new ApiError("Could not reach the server.");
  }
  const payload = (await response.json().catch(() => ({}))) as { message?: string; data?: PlatformLanding };
  if (!response.ok || !payload.data) throw new ApiError(payload.message || "Could not upload the image.");
  return payload.data;
}

export async function removePlatformLandingImage(token: string, slot: LandingSlot) {
  const result = await request<{ data: PlatformLanding }>(`/landing/${slot}`, { method: "DELETE", token });
  return result.data;
}

export async function sendPlatformEmail(token: string, body: { subject: string; type: string; institutionId: string; message: string }) {
  const result = await request<{ data: PlatformEmailResult }>("/email", { method: "POST", token, body });
  return result.data;
}
