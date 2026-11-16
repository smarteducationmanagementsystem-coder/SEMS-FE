import { routes } from "@/constants/routes";

export const platformStats = [
  { value: "48k+", label: "Students managed" },
  { value: "320", label: "Institutions" },
  { value: "6.4k", label: "Teachers" },
  { value: "99.9%", label: "Fee records reconciled" },
] as const;

export const platformFeatures = [
  {
    title: "Student records",
    href: routes.students,
    body: "Admissions, guardian details, class placement, academic history, and a profile that stays current through the year.",
  },
  {
    title: "Fee collection",
    href: routes.fees,
    body: "Class-wise fee structures, monthly challans, scholarships, late fees, and a clear view of what is still outstanding.",
  },
  {
    title: "Attendance",
    href: routes.attendance,
    body: "Mark present, absent, late, or leave by class. Monthly percentages update for students, parents, and the office.",
  },
  {
    title: "Exams and results",
    href: routes.results,
    body: "Schedules, subject marks, automatic grades and positions, then result cards you can print for the class.",
  },
  {
    title: "Staff and teachers",
    href: routes.teachers,
    body: "Employment profiles, subject assignments, and a separate attendance register for the people who run the campus.",
  },
  {
    title: "Reports",
    href: routes.reports,
    body: "Filter by month, session, class, or student, then export a performance, attendance, or fee report as PDF or Excel.",
  },
] as const;

export const benefits = [
  { title: "One source of truth", body: "Admissions, fees, and marks stop living in separate files. Every role sees the same student." },
  { title: "Less office time", body: "Monthly challans, attendance percentages, and result positions are calculated as the data is entered." },
  { title: "Clear for families", body: "Students and parents open their own view for attendance, fee status, and published results." },
  { title: "Ready for a real backend", body: "Screens read from a single data layer, so an API can replace the demo records later without a redesign." },
] as const;

export const platformFaqs = [
  {
    question: "Who is Smart Education Management System for?",
    answer: "Schools, colleges, and academies that need one system for students, teachers, attendance, fees, examinations, and reports.",
  },
  {
    question: "Can different people see different things?",
    answer:
      "Yes. Super admins oversee institutions. Institution admins run the campus. Teachers mark attendance and enter marks. Accountants handle fees. Students and parents see their own records.",
  },
  {
    question: "Does it print fee slips and result cards?",
    answer: "Each slip and result card can be opened as a print-ready page and saved as a PDF. Reports can also be downloaded as a spreadsheet.",
  },
  {
    question: "Is the demo connected to a live school database?",
    answer: "This frontend runs on realistic sample data so every screen can be reviewed. The structure is ready for a backend API to take over later.",
  },
] as const;

export const abilities = [
  { title: "Students", href: routes.students, body: "Admissions, class placement, guardians, and a student profile that stays current through the year." },
  { title: "Teachers", href: routes.teachers, body: "Subject teachers, the classes they take, and the qualifications the office keeps on file." },
  { title: "Staff", href: routes.staff, body: "Non-teaching staff who run the office, accounts desk, and campus support." },
  { title: "Attendance", href: routes.attendance, body: "Daily present, absent, late, and leave marks for students, then a monthly percentage." },
  { title: "Fees", href: routes.fees, body: "Class fee structures, monthly challans, partial payments, and what is still outstanding." },
  { title: "Exams", href: routes.exams, body: "Exam schedules, subjects, and the marks teachers enter for each paper." },
  { title: "Results", href: routes.results, body: "Percentages, grades, class positions, and a result card the office can print." },
  { title: "Reports", href: routes.reports, body: "Attendance, fee, and performance reports for a month, session, class, or student." },
  { title: "Classes and timetable", href: `${routes.admin}/academics`, body: "Classes, sections, subjects, and the weekly timetable for the campus." },
  { title: "Roles", href: `${routes.admin}/roles`, body: "The institution owner, teachers, and students each see only their own work." },
] as const;

export const marketingNav = [
  { label: "Home", href: routes.home },
  { label: "Service", href: routes.service },
  { label: "Pricing", href: routes.pricing },
  { label: "About", href: routes.about },
] as const;
