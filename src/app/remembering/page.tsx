import type { Metadata, Viewport } from "next";
import { Noto_Serif_Telugu } from "next/font/google";
import Experience from "./Experience";
import { getMedia } from "../../lib/media";

// Re-checks the media list every minute, so new photos and videos appear without redeploying.
export const revalidate = 60;
export const viewport: Viewport = { width: 1100 };

const serif = Noto_Serif_Telugu({
  subsets: ["telugu", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const title = "In loving memory – శ్రీమాన్ చక్రహరి మురళీధర్ రాజు గారు";
const description = "Share your memories of him. జ్ఞాపకాలను పంచుకోండి.";

export async function generateMetadata(): Promise<Metadata> {
  const media = await getMedia();
  const first = media.find((m) => m.type === "image");
  const url = first ? (first.src.startsWith("http") ? first.src : `https://www.arwinai.com${first.src}`) : undefined;
  return { title, description, openGraph: { title, description, images: url ? [{ url }] : undefined } };
}

export default async function RememberingPage() {
  const media = await getMedia();
  return <Experience media={media} fontClass={serif.className} />;
}
