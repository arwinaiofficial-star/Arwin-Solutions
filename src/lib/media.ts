import { readdirSync } from "fs";
import path from "path";
import type { MediaItem } from "./mediaTypes";

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });
const IMG = /\.(jpe?g|png|webp|avif|gif)$/i;
const VID = /\.(mp4|webm|mov|m4v)$/i;

// 1) Files committed to the repo: public/remembering/media (1.jpg, 2.png, 3.mp4 ...)
function localMedia(): MediaItem[] {
  try {
    const dir = path.join(process.cwd(), "public", "remembering", "media");
    return readdirSync(dir)
      .filter((f) => IMG.test(f) || VID.test(f))
      .sort(natural)
      .map((f) => {
        const src = `/remembering/media/${f}`;
        return { type: IMG.test(f) ? "image" : "video", src, thumb: src, back: src } as MediaItem;
      });
  } catch {
    return [];
  }
}

// 2) Files uploaded to Cloudinary with the tag "memories" (no redeploy needed).
type CloudRes = { public_id: string; version?: number };

async function cloudList(cloud: string, tag: string, kind: "image" | "video"): Promise<CloudRes[]> {
  try {
    const res = await fetch(`https://res.cloudinary.com/${cloud}/${kind}/list/${encodeURIComponent(tag)}.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.resources) ? json.resources : [];
  } catch {
    return [];
  }
}

const enc = (id: string) => id.split("/").map(encodeURIComponent).join("/");

async function cloudMedia(): Promise<MediaItem[]> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return [];
  const tag = process.env.CLOUDINARY_TAG || "memories";
  const [images, videos] = await Promise.all([cloudList(cloud, tag, "image"), cloudList(cloud, tag, "video")]);
  const base = `https://res.cloudinary.com/${cloud}`;
  const ver = (r: CloudRes) => (r.version ? `v${r.version}/` : "");

  const all: { id: string; item: MediaItem }[] = [
    ...images.map((r) => ({
      id: r.public_id,
      item: {
        type: "image" as const,
        src: `${base}/image/upload/f_auto,q_auto,w_1600/${ver(r)}${enc(r.public_id)}`,
        thumb: `${base}/image/upload/f_auto,q_auto,w_700/${ver(r)}${enc(r.public_id)}`,
        back: `${base}/image/upload/f_auto,q_auto:low,w_1200/${ver(r)}${enc(r.public_id)}`,
      },
    })),
    ...videos.map((r) => ({
      id: r.public_id,
      item: {
        type: "video" as const,
        src: `${base}/video/upload/q_auto,vc_h264,w_1000/${ver(r)}${enc(r.public_id)}.mp4`,
        thumb: `${base}/video/upload/q_auto,vc_h264,w_480/${ver(r)}${enc(r.public_id)}.mp4`,
        back: "",
        poster: `${base}/video/upload/so_0,q_auto,w_700/${ver(r)}${enc(r.public_id)}.jpg`,
      },
    })),
  ];
  return all.sort((a, b) => natural(a.id, b.id)).map((x) => x.item);
}

export async function getMedia(): Promise<MediaItem[]> {
  return [...localMedia(), ...(await cloudMedia())];
}
