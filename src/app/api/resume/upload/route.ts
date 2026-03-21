import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText = "";

    if (file.type === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text;
    } else {
      // For DOCX, extract basic text
      const text = buffer.toString("utf-8");
      // Strip XML tags for basic extraction
      rawText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from the file. Please try a different file." },
        { status: 400 }
      );
    }

    // Forward to backend LLM for structured extraction
    const token = request.headers.get("authorization");
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    const extractResponse = await fetch(`${backendUrl}/api/v1/resume/chat`, {
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
      return NextResponse.json({
        success: true,
        rawText: rawText.slice(0, 3000),
        extractedData: data.reply ? JSON.parse(data.reply) : null,
        fileName: file.name,
      });
    }

    // If backend extraction fails, return raw text for frontend processing
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
