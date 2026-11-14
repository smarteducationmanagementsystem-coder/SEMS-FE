/**
 * Public and campus paths. Build links with these helpers rather than
 * string literals so a URL change only needs to happen here.
 */
export const routes = {
  home: "/",
  students: "/students",
  teachers: "/teachers",
  staff: "/staff",
  fees: "/fees",
  attendance: "/attendance",
  exams: "/exams",
  results: "/results",
  reports: "/reports",
  features: "/features",
  service: "/service",
  pricing: "/pricing",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
  admin: "/dashboard",
  signup: "/signup",
  login: "/login",
  studentLogin: "/student-login",
  teacherLogin: "/teacher-login",
  platformAdmin: "/platformadmin",
  platformDashboard: "/platformadmin/dashboard",
  platformInstitutions: "/platformadmin/institutions",
  platformPayments: "/platformadmin/payments",
  platformPending: "/platformadmin/pending-payments",
  platformEmail: "/platformadmin/email",
  platformContact: "/platformadmin/contact",
  platformPricing: "/platformadmin/pricing",
  platformSettings: "/platformadmin/settings",
} as const;

/** Pages that hold per-visitor state and should never be indexed. */
export const nonIndexableRoutes = [routes.admin, routes.platformAdmin] as const;
