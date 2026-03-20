import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const NOTIFY_TO = process.env.CONNECT_NOTIFY_EMAIL || "hr@arwinai.com";
const FROM_ADDRESS = process.env.CONNECT_FROM_EMAIL || "Arwin Connect <onboarding@resend.dev>";

interface Submission {
  referenceId: string;
  intent: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  organization?: string;
  projectType?: string;
  customProjectType?: string;
  budget?: string;
  customBudget?: string;
  timeline?: string;
  customTimeline?: string;
  projectDescription?: string;
  services?: string[];
  howFound?: string;
  partnershipType?: string;
  customPartnershipType?: string;
  position?: string;
  portfolio?: string;
  submittedAt: string;
}

const INTENT_LABELS: Record<string, string> = {
  message: "Quick Message",
  project: "Project Enquiry",
  partnership: "Partnership Enquiry",
  careers: "Career Application",
};

const INTENT_COLORS: Record<string, string> = {
  message: "#3b82f6",
  project: "#10b981",
  partnership: "#8b5cf6",
  careers: "#f59e0b",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRow(label: string, value: string | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#64748b;white-space:nowrap;vertical-align:top;font-size:14px;">${label}</td>
      <td style="padding:8px 12px;color:#1e293b;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

function buildNotificationHtml(data: Submission): string {
  const intentLabel = INTENT_LABELS[data.intent] || data.intent;
  const intentColor = INTENT_COLORS[data.intent] || "#3b82f6";

  let detailRows = "";

  // Common fields
  detailRows += buildRow("Name", data.name);
  detailRows += buildRow("Email", data.email);
  detailRows += buildRow("Phone", data.phone);

  // Intent-specific fields
  switch (data.intent) {
    case "message":
      detailRows += buildRow("Subject", data.subject);
      detailRows += buildRow("Message", data.message);
      break;
    case "project":
      detailRows += buildRow("Organization", data.organization);
      detailRows += buildRow("Project Type", data.projectType === "custom" ? `Custom: ${data.customProjectType}` : data.projectType);
      detailRows += buildRow("Budget", data.budget === "custom" ? `Custom: ${data.customBudget}` : data.budget);
      detailRows += buildRow("Timeline", data.timeline === "custom" ? `Custom: ${data.customTimeline}` : data.timeline);
      detailRows += buildRow("Description", data.projectDescription);
      if (data.services && data.services.length > 0) {
        detailRows += buildRow("Services", data.services.join(", "));
      }
      detailRows += buildRow("Found via", data.howFound);
      break;
    case "partnership":
      detailRows += buildRow("Organization", data.organization);
      detailRows += buildRow("Partnership Type", data.partnershipType === "custom" ? `Custom: ${data.customPartnershipType}` : data.partnershipType);
      detailRows += buildRow("Details", data.message);
      break;
    case "careers":
      detailRows += buildRow("Position", data.position);
      detailRows += buildRow("Portfolio", data.portfolio);
      detailRows += buildRow("About", data.message);
      break;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px 28px;text-align:center;">
      <h1 style="margin:0 0 8px;color:#fff;font-size:18px;font-weight:700;">Arwin Connect</h1>
      <div style="display:inline-block;padding:4px 14px;border-radius:9999px;background:${intentColor};color:#fff;font-size:13px;font-weight:600;">
        ${intentLabel}
      </div>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-top:none;">
      <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Reference ID</p>
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#2563eb;letter-spacing:0.05em;font-family:monospace;">
        ${data.referenceId}
      </p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;">
        ${detailRows}
      </table>

      <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        Submitted at ${new Date(data.submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;border-radius:0 0 12px 12px;padding:16px 28px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">
        Reply directly to <a href="mailto:${escapeHtml(data.email)}" style="color:#2563eb;">${escapeHtml(data.email)}</a> to respond to this enquiry.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildSubject(data: Submission): string {
  const tag = INTENT_LABELS[data.intent] || "New";
  switch (data.intent) {
    case "message":
      return `[${tag}] ${data.subject || "New message"} — ${data.name}`;
    case "project":
      return `[${tag}] ${data.organization || "New project"} — ${data.name}`;
    case "partnership":
      return `[${tag}] ${data.organization || "New partnership"} — ${data.name}`;
    case "careers":
      return `[${tag}] ${data.position || "New application"} — ${data.name}`;
    default:
      return `[Arwin Connect] New submission from ${data.name}`;
  }
}

export async function sendNotification(data: Submission): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Arwin Connect] RESEND_API_KEY not set — skipping email notification");
    return { success: false, error: "Email not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: [NOTIFY_TO],
      replyTo: data.email,
      subject: buildSubject(data),
      html: buildNotificationHtml(data),
    });

    clearTimeout(timeout);

    if (error) {
      console.error("[Arwin Connect] Email send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[Arwin Connect] Email send error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
