/**
 * Institution policies. Pages built from this file show a placeholder notice
 * until `isPlaceholder` is set to false with reviewed text.
 */
import { siteConfig } from "./site";

export interface PolicySection {
  heading: string;
  body: string[];
}

export interface PolicyPage {
  title: string;
  summary: string;
  isPlaceholder: boolean;
  lastUpdated: string;
  sections: PolicySection[];
}

export const privacyPolicy: PolicyPage = {
  title: "Privacy Policy",
  summary: `How ${siteConfig.name} collects, uses, and protects institution and student information.`,
  isPlaceholder: true,
  lastUpdated: "2026-11-06",
  sections: [
    {
      heading: "Information we collect",
      body: [
        "When an institution requests a demo or creates an account, we collect the contact name, work email, phone number, and institution details.",
        "This preview keeps student, fee, and attendance records in the browser session. They are sample records, not a live school database.",
      ],
    },
    {
      heading: "How we use it",
      body: ["To respond to demo requests, provide the education platform, and send operational notices such as fee reminders when an institution enables them."],
    },
    {
      heading: "Sharing",
      body: ["Student and staff records stay inside the institution's workspace. We do not sell personal data."],
    },
    {
      heading: "Your choices",
      body: [`An institution admin can ask us to access, correct, or delete account data by emailing ${siteConfig.contact.email}.`],
    },
  ],
};

export const termsPolicy: PolicyPage = {
  title: "Terms & Conditions",
  summary: `The terms that apply when an institution uses ${siteConfig.name}.`,
  isPlaceholder: true,
  lastUpdated: "2026-11-06",
  sections: [
    {
      heading: "The service",
      body: [
        `${siteConfig.name} provides software for managing students, staff, attendance, fees, examinations, and reports. The public site and dashboard in this preview use sample data.`,
      ],
    },
    {
      heading: "Plans and pricing",
      body: ["Published prices are in Pakistani rupees and describe the Basic, Professional, and Enterprise plans. A subscription starts only after a written confirmation."],
    },
    {
      heading: "Institution data",
      body: ["The institution is responsible for the accuracy of student, guardian, and staff records entered into the system, and for assigning the correct role to each user."],
    },
    {
      heading: "Governing law",
      body: ["These terms are governed by the laws of Pakistan."],
    },
  ],
};
