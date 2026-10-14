import type { Opportunity } from "@/types";

export type TrustSeverity = "info" | "caution";

export interface TrustFlag {
  id: string;
  severity: TrustSeverity;
  message: string;
}

export interface TrustReport {
  flags: TrustFlag[];
  summary: string;
  didVerifyUrl: false;
}

const URGENT = /\b(urgent|immediately|today only|whatsapp|gift card|registration fee|processing fee)\b/i;
const PAYMENT = /\b(pay (now|upfront)|wire transfer|crypto|registration fee|processing fee)\b/i;
const SENSITIVE = /\b(otp|password|aadhaar|bank account|pan card|ssn)\b/i;

function host(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function evaluateTrust(opportunity: Opportunity): TrustReport {
  const flags: TrustFlag[] = [];
  const text = `${opportunity.title} ${opportunity.description} ${opportunity.requirements.join(" ")}`;

  if (opportunity.isDemo) {
    flags.push({
      id: "demo",
      severity: "info",
      message: "Demonstration listing. This is not a verified live opportunity.",
    });
  }

  const applyHost = host(opportunity.applicationUrl);
  const sourceHost = opportunity.sourceUrl ? host(opportunity.sourceUrl) : applyHost;
  if (applyHost && sourceHost && applyHost !== sourceHost) {
    flags.push({
      id: "host-mismatch",
      severity: "caution",
      message: "Application URL host differs from the listed source host. Confirm on an official site before sharing data.",
    });
  }

  if (!opportunity.organization.trim() || opportunity.organization.toLowerCase().includes("example")) {
    flags.push({
      id: "org-placeholder",
      severity: "info",
      message: "Organization name looks like a placeholder or is incomplete. Treat as unverified.",
    });
  }

  if (URGENT.test(text)) {
    flags.push({
      id: "urgent-language",
      severity: "caution",
      message: "Copy uses urgent language. That is a heuristic flag, not proof of fraud.",
    });
  }

  if (PAYMENT.test(text)) {
    flags.push({
      id: "payment",
      severity: "caution",
      message: "Text mentions fees or payment. Legitimate applications rarely require upfront payment to a stranger.",
    });
  }

  if (SENSITIVE.test(text)) {
    flags.push({
      id: "sensitive",
      severity: "caution",
      message: "Text references sensitive personal data. Do not share OTPs, passwords, or ID numbers through unofficial channels.",
    });
  }

  if (!opportunity.applicationUrl.startsWith("https://")) {
    flags.push({
      id: "insecure-link",
      severity: "caution",
      message: "Application link is not HTTPS. Confirm the official destination before applying.",
    });
  }

  const cautionCount = flags.filter((f) => f.severity === "caution").length;
  const summary =
    cautionCount === 0
      ? "No high-severity heuristic flags. URL reachability was not checked."
      : `${cautionCount} caution flag(s). These are explainable heuristics, not a fraud verdict. URL reachability was not checked.`;

  return { flags, summary, didVerifyUrl: false };
}
