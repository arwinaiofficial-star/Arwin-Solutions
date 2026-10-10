// Storage on top of the Upstash Redis REST API (no extra npm packages).
// Works with Upstash env names or the names Vercel's Upstash integration adds.
import type { Memory } from "./memoryTypes";

export type StoredAudio = { type: string; data: string };

const BASE = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const KEY = "memories:muralidhar-raju";
const AUDIO_KEY = "memory-audio:muralidhar-raju";

async function redis(command: (string | number)[]) {
  if (!BASE || !TOKEN) throw new Error("Storage is not configured");
  const res = await fetch(BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error ?? "Storage error");
  return json.result;
}

export async function listMemories(): Promise<Memory[]> {
  const flat = (await redis(["HGETALL", KEY])) as string[] | null;
  const out: Memory[] = [];
  for (let i = 1; flat && i < flat.length; i += 2) {
    try {
      const parsed = JSON.parse(flat[i]) as Partial<Memory>;
      out.push({ first: "", hasAudio: false, ...parsed } as Memory);
    } catch {
      /* skip a corrupted entry */
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addMemory(memory: Memory, audio?: StoredAudio) {
  if (audio) await redis(["HSET", AUDIO_KEY, memory.id, JSON.stringify(audio)]);
  await redis(["HSET", KEY, memory.id, JSON.stringify(memory)]);
}

export async function getAudio(id: string): Promise<StoredAudio | null> {
  const raw = (await redis(["HGET", AUDIO_KEY, id])) as string | null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAudio;
  } catch {
    return null;
  }
}

export async function deleteMemory(id: string) {
  await redis(["HDEL", KEY, id]);
  await redis(["HDEL", AUDIO_KEY, id]);
}

// Returns true when this IP has posted too many times in the window.
export async function isRateLimited(ip: string, max = 8, windowSeconds = 3600) {
  const key = `ratelimit:${ip}`;
  const count = (await redis(["INCR", key])) as number;
  if (count === 1) await redis(["EXPIRE", key, windowSeconds]);
  return count > max;
}
