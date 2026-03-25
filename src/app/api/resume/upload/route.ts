import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/api/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MammothModule = {
  extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>;
};

function loadMammoth(): MammothModule | null {
  try {
    // Keep DOCX extraction optional so builds do not fail on stale local installs.
    const runtimeRequire = eval("require") as (id: string) => MammothModule;
    return runtimeRequire("mammoth");
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — check both MIME and extension for robustness
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream", // some browsers send this for PDFs
    ];
    const ext = file.name.toLowerCase().split(".").pop();
    const allowedExts = ["pdf", "docx"];

    if (!allowedMimes.includes(file.type) && !allowedExts.includes(ext || "")) {
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isPDF = file.type === "application/pdf" || ext === "pdf";

    let rawText = "";

    if (isPDF) {
      try {
        // pdf-parse doesn't have proper ESM types, use require
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text;
      } catch (pdfError) {
        console.error("pdf-parse failed:", pdfError);
        // Fallback: try basic text extraction from buffer
        rawText = buffer
          .toString("utf-8")
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    } else {
      // DOCX is a ZIP archive — use mammoth for proper extraction
      try {
        const mammoth = loadMammoth();
        if (!mammoth) {
          throw new Error("mammoth is not installed");
        }
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } catch (docxError) {
        console.error("mammoth DOCX extraction failed:", docxError);
        // Fallback: strip non-printable chars
        rawText = buffer
          .toString("utf-8")
          .replace(/[^\x20-\x7E\n\r\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file may be scanned/image-based. Please try a different file or start from scratch." },
        { status: 400 }
      );
    }

    // Try backend LLM extraction
    const token = request.headers.get("authorization");

    try {
      const extractResponse = await fetchBackend("/api/v1/resume/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({
          message: rawText.slice(0, 6000),
          action: "extract_cv",
          context: { raw_text: rawText.slice(0, 6000) },
        }),
      });

      if (extractResponse.ok) {
        const data = await extractResponse.json();
        let extractedData = null;
        if (data.reply) {
          try {
            extractedData = JSON.parse(data.reply);
          } catch {
            // Reply wasn't valid JSON — try to salvage
            // The LLM sometimes wraps in markdown code blocks
            const cleaned = data.reply
              .replace(/^```(?:json)?\s*/m, "")
              .replace(/\s*```\s*$/m, "")
              .trim();
            try {
              extractedData = JSON.parse(cleaned);
            } catch {
              // Still not JSON — use the text as a summary
              extractedData = { summary: data.reply };
            }
          }
        }
        return NextResponse.json({
          success: true,
          rawText: rawText.slice(0, 3000),
          extractedData,
          fileName: file.name,
        });
      } else {
        console.error("Backend extraction returned non-OK:", extractResponse.status);
      }
    } catch (backendError) {
      console.error("Backend extraction failed:", backendError);
    }

    // If backend extraction fails, return raw text so frontend can still populate summary
    return NextResponse.json({
      success: true,
      rawText: rawText.slice(0, 3000),
      extractedData: null,
      fileName: file.name,
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
