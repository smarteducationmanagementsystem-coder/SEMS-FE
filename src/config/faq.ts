/**
 * Public FAQ for the education platform.
 */
import { routes } from "@/constants/routes";
import { siteConfig } from "./site";

export interface FaqItem {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "The platform",
    items: [
      {
        question: `What is ${siteConfig.name}?`,
        answer: `${siteConfig.description} The tagline is "${siteConfig.tagline}"`,
        link: { label: "Read the story", href: routes.about },
      },
      {
        question: "Which institutions can use it?",
        answer: "Schools, colleges, and academies. A single campus can start on the Basic plan. Groups with more than one institution use the Enterprise controls.",
        link: { label: "See services", href: routes.service },
      },
      {
        question: "What can an administrator manage?",
        answer:
          "Students, teachers, staff, classes, subjects, academic sessions, daily attendance, fee challans, examinations, result cards, and monthly reports.",
        link: { label: "All services", href: routes.service },
      },
    ],
  },
  {
    title: "Roles",
    items: [
      {
        question: "Which roles are included?",
        answer:
          "Super Admin, Institution Admin, Teacher, Accountant, Student, and Parent. Each role opens a dashboard limited to the work that role is allowed to do.",
      },
      {
        question: "Can a parent see more than one child?",
        answer: "Yes. A parent view lists each linked student, with attendance, fee status, and published results for those children only.",
      },
    ],
  },
  {
    title: "Fees, exams, and reports",
    items: [
      {
        question: "How are fee slips created?",
        answer:
          "Set a fee structure per class, then generate monthly challans for one student or the whole class. Payments, discounts, scholarships, and late fees update the balance.",
      },
      {
        question: "How are grades calculated?",
        answer:
          "Entered marks are totalled by subject. The system calculates obtained marks, percentage, grade, and class position, then prints an individual result card or a class report.",
      },
      {
        question: "Can reports be exported?",
        answer: "Yes. Reports can be filtered by month, session, class, and student, then printed as a PDF or downloaded as a spreadsheet.",
        link: { label: "Open the dashboard", href: routes.admin },
      },
      {
        question: "How can we request a demo?",
        answer: `Email ${siteConfig.contact.email} or use the inquiry form. The team replies ${siteConfig.contact.supportHours}.`,
        link: { label: "Contact", href: routes.contact },
      },
    ],
  },
];
