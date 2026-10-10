import { NextResponse } from "next/server";
import { randomUUID, timingSafeEqual } from "crypto";
import { addMemory, deleteMemory, isRateLimited, listMemories } from "../../../lib/memoryStore";
import type { Memory } from "../../../lib/memoryTypes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RELATIONS = ["Family", "Relative", "Friend", "Neighbour", "Colleague", "Other"];
const AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/aac", "audio/x-m4a", "audio/wav"];
const MAX_AUDIO_BASE64 = 850_000; // about 600 KB of audio

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // remove control characters, keep new lines
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

function isAdmin(req: Request) {
  const key = process.env.MEMORY_ADMIN_KEY;
  const given = req.headers.get("x-admin-key") ?? "";
  if (!key || given.length !== key.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(key));
}

export async function GET() {
  try {
    return NextResponse.json({ memories: await listMemories() });
  } catch {
    return NextResponse.json({ error: "Could not load memories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Hidden "website" field: real people leave it empty, bots fill it.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true }, { status: 201 });

  const name = clean(body.name, 80);
  const relation = clean(body.relation, 30);
  const city = clean(body.city, 80);
  const first = clean(body.first, 1500);
  const message = clean(body.message, 3000);

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!RELATIONS.includes(relation))
    return NextResponse.json({ error: "Please choose how you knew him." }, { status: 400 });

  let audio: { type: string; data: string } | undefined;
  const rawAudio = body.audio;
  if (typeof rawAudio === "string" && rawAudio) {
    const type = clean(body.audioType, 60).split(";")[0].toLowerCase();
    if (!AUDIO_TYPES.includes(type))
      return NextResponse.json({ error: "This recording format is not supported." }, { status: 400 });
    if (rawAudio.length > MAX_AUDIO_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(rawAudio))
      return NextResponse.json({ error: "The recording is too large. Please record a shorter message." }, { status: 400 });
    audio = { type, data: rawAudio };
  }

  if (!audio && message.length < 10)
    return NextResponse.json({ error: "Please write a little more, or record your voice." }, { status: 400 });

  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    if (await isRateLimited(ip))
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });

    const memory: Memory = {
      id: randomUUID(),
      name,
      relation,
      city,
      first,
      message,
      hasAudio: Boolean(audio),
      createdAt: Date.now(),
    };
    await addMemory(memory, audio);
    return NextResponse.json({ memory }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    await deleteMemory(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
