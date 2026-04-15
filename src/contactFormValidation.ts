export type RequestKind = "training" | "tool-support";

export interface ContactFormValues {
  requestKind: RequestKind | "";
  fullName: string;
  email: string;
  phone: string;
  projectName: string;
  projectManagerName: string;
  projectManagerEmail: string;
  description: string;
}

export interface ContactFormErrors {
  requestKind?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  projectName?: string;
  projectManagerName?: string;
  projectManagerEmail?: string;
  description?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_RE = /\d/g;

export function countPhoneDigits(phone: string): number {
  return (phone.match(PHONE_DIGITS_RE) ?? []).length;
}

export function validateContactForm(v: ContactFormValues): ContactFormErrors {
  const e: ContactFormErrors = {};

  if (v.requestKind !== "training" && v.requestKind !== "tool-support") {
    e.requestKind = "Choose one option.";
  }

  const name = v.fullName.trim();
  if (name.length < 2) {
    e.fullName = "Enter your full name (at least 2 characters).";
  }

  const mail = v.email.trim();
  if (!mail) {
    e.email = "Email is required.";
  } else if (!EMAIL_RE.test(mail)) {
    e.email = "Enter a valid email address.";
  }

  const digits = countPhoneDigits(v.phone);
  if (digits < 10) {
    e.phone = "Enter a valid phone number (at least 10 digits).";
  }

  const proj = v.projectName.trim();
  if (proj.length < 2) {
    e.projectName = "Project name is required.";
  }

  const pmn = v.projectManagerName.trim();
  if (pmn.length < 2) {
    e.projectManagerName = "Project manager name is required.";
  }

  const pme = v.projectManagerEmail.trim();
  if (!pme) {
    e.projectManagerEmail = "Project manager email is required.";
  } else if (!EMAIL_RE.test(pme)) {
    e.projectManagerEmail = "Enter a valid project manager email.";
  }

  const desc = v.description.trim();
  if (desc.length < 10) {
    e.description = "Please add a short description (at least 10 characters).";
  } else if (desc.length > 4000) {
    e.description = "Description is too long (max 4,000 characters).";
  }

  return e;
}

export function buildContactMailto(v: ContactFormValues, toEmail: string): string {
  const kind = v.requestKind === "training" ? "Accessibility training" : "Tool explain & support";
  const subject = encodeURIComponent(`[LAAL Contact] ${kind} — ${v.projectName.trim()}`);
  const body = encodeURIComponent(
    [
      `Request: ${kind}`,
      "",
      `Name: ${v.fullName.trim()}`,
      `Email: ${v.email.trim()}`,
      `Phone: ${v.phone.trim()}`,
      "",
      `Project: ${v.projectName.trim()}`,
      `Project manager: ${v.projectManagerName.trim()}`,
      `PM email: ${v.projectManagerEmail.trim()}`,
      "",
      "Description:",
      v.description.trim(),
    ].join("\n")
  );
  return `mailto:${toEmail}?subject=${subject}&body=${body}`;
}
