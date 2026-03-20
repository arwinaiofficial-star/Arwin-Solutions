import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { sendNotification } from "@/lib/email";
import logger from "@/lib/logger";

// Validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_ORG_LENGTH = 200;
const MAX_URL_LENGTH = 500;

const VALID_INTENTS = ["message", "project", "partnership", "careers"] as const;
type Intent = (typeof VALID_INTENTS)[number];

const VALID_PROJECT_TYPES = [
  "government", "education", "enterprise", "ecommerce", "healthcare",
  "real-estate", "community", "startup", "nonprofit", "custom",
] as const;

const VALID_BUDGETS = [
  "under-50k", "50k-1L", "1-2L", "2-3L", "3-5L", "above-5L", "not-sure", "custom",
] as const;

const VALID_TIMELINES = [
  "urgent", "standard", "flexible", "not-decided", "custom",
] as const;

const VALID_PARTNERSHIP_TYPES = [
  "technology", "reseller", "referral", "strategic", "custom",
] as const;

const VALID_SERVICES = [
  "Website Development",
  "Web Application Development",
  "Mobile App Development",
  "AI Integration & Solutions",
  "Design System Implementation",
  "Custom CMS Development",
  "E-commerce Solutions",
  "Portal Development",
  "Legacy System Modernization",
  "Consulting & Strategy",
] as const;

function sanitize(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>]/g, "");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= MAX_EMAIL_LENGTH;
}

function generateReferenceId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "AC-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request.headers);

  // Rate limit: 5 submissions per 5 minutes
  const rateLimit = checkRateLimit(`connect:${clientIP}`, {
    maxRequests: 5,
    windowMs: 300000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const intent = body.intent as string;

    if (!intent || !VALID_INTENTS.includes(intent as Intent)) {
      return NextResponse.json({ error: "Invalid request type." }, { status: 400 });
    }

    // Validate common fields
    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const phone = sanitize(body.phone).slice(0, MAX_PHONE_LENGTH);

    if (!name || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "A valid name is required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const referenceId = generateReferenceId();

    const submission: Record<string, unknown> = {
      referenceId,
      intent,
      name,
      email,
      phone: phone || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Intent-specific validation
    switch (intent) {
      case "message": {
        const subject = sanitize(body.subject);
        const message = sanitize(body.message);
        if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
          return NextResponse.json({ error: "Subject is required." }, { status: 400 });
        }
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json({ error: "Message is required." }, { status: 400 });
        }
        submission.subject = subject;
        submission.message = message;
        break;
      }

      case "project": {
        const organization = sanitize(body.organization);
        const projectType = String(body.projectType || "");
        const projectDescription = sanitize(body.projectDescription);

        if (!organization || organization.length > MAX_ORG_LENGTH) {
          return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
        }
        if (!VALID_PROJECT_TYPES.includes(projectType as typeof VALID_PROJECT_TYPES[number])) {
          return NextResponse.json({ error: "Please select a valid project type." }, { status: 400 });
        }
        if (projectType === "custom") {
          const customProjectType = sanitize(body.customProjectType);
          if (!customProjectType || customProjectType.length > MAX_SUBJECT_LENGTH) {
            return NextResponse.json({ error: "Please describe your custom project type." }, { status: 400 });
          }
          submission.customProjectType = customProjectType;
        }
        if (!projectDescription || projectDescription.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json({ error: "Project description is required." }, { status: 400 });
        }

        const budget = VALID_BUDGETS.includes(body.budget as typeof VALID_BUDGETS[number]) ? body.budget : undefined;
        if (budget === "custom") {
          const customBudget = sanitize(body.customBudget);
          if (!customBudget || customBudget.length > MAX_SUBJECT_LENGTH) {
            return NextResponse.json({ error: "Please enter your custom budget." }, { status: 400 });
          }
          submission.customBudget = customBudget;
        }
        const timeline = VALID_TIMELINES.includes(body.timeline as typeof VALID_TIMELINES[number]) ? body.timeline : undefined;
        if (timeline === "custom") {
          const customTimeline = sanitize(body.customTimeline);
          if (!customTimeline || customTimeline.length > MAX_SUBJECT_LENGTH) {
            return NextResponse.json({ error: "Please describe your custom timeline." }, { status: 400 });
          }
          submission.customTimeline = customTimeline;
        }
        const services = Array.isArray(body.services)
          ? body.services.filter((s: string) => VALID_SERVICES.includes(s as typeof VALID_SERVICES[number]))
          : [];
        const howFound = sanitize(body.howFound).slice(0, 200) || undefined;

        Object.assign(submission, {
          organization,
          projectType,
          budget,
          timeline,
          projectDescription,
          services: services.length > 0 ? services : undefined,
          howFound,
        });
        break;
      }

      case "partnership": {
        const organization = sanitize(body.organization);
        const partnershipType = String(body.partnershipType || "");
        const message = sanitize(body.message);

        if (!organization || organization.length > MAX_ORG_LENGTH) {
          return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
        }
        if (!VALID_PARTNERSHIP_TYPES.includes(partnershipType as typeof VALID_PARTNERSHIP_TYPES[number])) {
          return NextResponse.json({ error: "Please select a partnership type." }, { status: 400 });
        }
        if (partnershipType === "custom") {
          const customPartnershipType = sanitize(body.customPartnershipType);
          if (!customPartnershipType || customPartnershipType.length > MAX_SUBJECT_LENGTH) {
            return NextResponse.json({ error: "Please describe your custom partnership type." }, { status: 400 });
          }
          submission.customPartnershipType = customPartnershipType;
        }
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json({ error: "Please describe the collaboration." }, { status: 400 });
        }

        Object.assign(submission, { organization, partnershipType, message });
        break;
      }

      case "careers": {
        const position = sanitize(body.position);
        const portfolio = sanitize(body.portfolio);
        const message = sanitize(body.message);

        if (!position || position.length > MAX_SUBJECT_LENGTH) {
          return NextResponse.json({ error: "Position of interest is required." }, { status: 400 });
        }
        if (portfolio && portfolio.length > MAX_URL_LENGTH) {
          return NextResponse.json({ error: "Portfolio URL is too long." }, { status: 400 });
        }
        if (!message || message.length > MAX_MESSAGE_LENGTH) {
          return NextResponse.json({ error: "Please tell us about yourself." }, { status: 400 });
        }

        Object.assign(submission, {
          position,
          portfolio: portfolio || undefined,
          message,
        });
        break;
      }
    }

    // Log the submission
    logger.info("Arwin Connect submission received", {
      referenceId,
      intent,
      name,
      email,
    });

    // Send email notification (fire-and-forget — don't block the response)
    sendNotification(submission as unknown as Parameters<typeof sendNotification>[0]).then((emailResult) => {
      if (!emailResult.success) {
        logger.warn("Email notification failed", { referenceId, error: emailResult.error });
      }
    });

    return NextResponse.json({
      success: true,
      referenceId,
      message: "Your message has been received. We'll get back to you soon!",
    });
  } catch {
    logger.error("Failed to process Arwin Connect submission");
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
