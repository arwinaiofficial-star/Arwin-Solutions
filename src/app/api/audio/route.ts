import { getAudio } from "../../../lib/memoryStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Serves a saved voice message. Supports Range requests so Safari can play it.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  let audio;
  try {
    audio = await getAudio(id);
  } catch {
    return new Response("Error", { status: 500 });
  }
  if (!audio) return new Response("Not found", { status: 404 });

  const buf = Buffer.from(audio.data, "base64");
  const size = buf.length;
  const headers: Record<string, string> = {
    "Content-Type": audio.type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=300",
  };

  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? parseInt(range[1], 10) : 0;
    let end = range[2] ? parseInt(range[2], 10) : size - 1;
    if (start >= size || end < start) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    end = Math.min(end, size - 1);
    const chunk = new Uint8Array(buf.subarray(start, end + 1));
    return new Response(chunk, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(chunk.length) },
    });
  }

  return new Response(new Uint8Array(buf), { status: 200, headers: { ...headers, "Content-Length": String(size) } });
}
