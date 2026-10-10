export type MediaItem = {
  type: "image" | "video";
  src: string; // full size (lightbox)
  thumb: string; // grid size
  back: string; // light version for the background
  poster?: string; // still frame for a video
};
