import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.join(process.cwd(), "public", "logos");
const outputDir = path.join(inputDir, "cleaned");

const logos = [
  { source: "NTPC_Logo.svg.png", slug: "ntpc", remove: "none" },
  { source: "Travancore devaswom borad.png", slug: "travancore-devaswom-board", remove: "white" },
  { source: "adarsh motots.jpg", slug: "adarsh-motors", remove: "white" },
  { source: "aditya ayurvedam.png", slug: "aditya-ayurvedam", remove: "white" },
  { source: "akshara group.jpg", slug: "akshara-group", remove: "white" },
  { source: "amrutha ivf.jpg", slug: "amrutha-ivf", remove: "white" },
  { source: "cbit.png", slug: "cbit", remove: "none" },
  { source: "cheeriyal lakshmi narimha.jpg", slug: "cheeriyal-lakshmi-narasimha", remove: "none" },
  { source: "cropped-Geetanjali-College-1.png", slug: "geetanjali-college", remove: "white" },
  { source: "drda.jpg", slug: "drda", remove: "white" },
  {
    source:
      "hyderabad-government-of-telangana-kakatiya-kala-thoranam-government-of-india-emblem-of-telangana-government-81950ebbeaf7d8e07ebc33e9d4d7421b.png",
    slug: "government-of-telangana",
    remove: "none",
  },
  { source: "indian railways.png", slug: "indian-railways", remove: "white" },
  { source: "jeeyar education trust.png", slug: "jeeyar-education-trust", remove: "none" },
  { source: "kapil group.jpg", slug: "kapil-group", remove: "white" },
  { source: "keesara.jpg", slug: "keesara", remove: "light" },
  { source: "kendriya-vidyalaya-sangathan-Black.png", slug: "kendriya-vidyalaya-sangathan", remove: "none" },
  { source: "nic.jpg", slug: "nic", remove: "white" },
  { source: "nirmala convent.jpg", slug: "nirmala-convent", remove: "light" },
  { source: "soorya hospitals.png", slug: "soorya-hospitals", remove: "white" },
  { source: "st anns school.webp", slug: "st-anns-school", remove: "none" },
  { source: "st johns.png", slug: "st-johns", remove: "white" },
  { source: "telanganan  bhatraju.jpg", slug: "telangana-bhatraju", remove: "black" },
  { source: "telugu film chamber.webp", slug: "telugu-film-chamber", remove: "black" },
  { source: "ttd.png", slug: "ttd", remove: "none" },
];

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function applyBackgroundRemoval(data, mode) {
  if (mode === "none") {
    return data;
  }

  const output = Buffer.from(data);

  for (let i = 0; i < output.length; i += 4) {
    const r = output[i];
    const g = output[i + 1];
    const b = output[i + 2];
    const currentAlpha = output[i + 3];

    let alphaMultiplier = 1;

    if (mode === "white") {
      const distanceFromWhite = Math.max(255 - r, 255 - g, 255 - b);

      if (distanceFromWhite <= 10) {
        alphaMultiplier = 0;
      } else if (distanceFromWhite <= 38) {
        alphaMultiplier = (distanceFromWhite - 10) / 28;
      }
    }

    if (mode === "light") {
      const brightness = Math.min(r, g, b);
      const colorSpread = Math.max(r, g, b) - Math.min(r, g, b);

      if (brightness >= 222 && colorSpread <= 42) {
        alphaMultiplier = 0;
      } else if (brightness >= 188 && colorSpread <= 56) {
        alphaMultiplier = (222 - brightness) / 34;
      }
    }

    if (mode === "black") {
      const distanceFromBlack = Math.max(r, g, b);

      if (distanceFromBlack <= 12) {
        alphaMultiplier = 0;
      } else if (distanceFromBlack <= 42) {
        alphaMultiplier = (distanceFromBlack - 12) / 30;
      }
    }

    output[i + 3] = clamp(currentAlpha * alphaMultiplier);
  }

  return output;
}

async function buildLogo({ source, slug, remove }) {
  const inputPath = path.join(inputDir, source);
  const outputPath = path.join(outputDir, `${slug}.png`);
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const processed = applyBackgroundRemoval(data, remove);

  await sharp(processed, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 12 })
    .extend({
      top: 28,
      right: 28,
      bottom: 28,
      left: 28,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outputPath);
}

await fs.promises.mkdir(outputDir, { recursive: true });

for (const logo of logos) {
  await buildLogo(logo);
}

console.log(`Processed ${logos.length} logo files into ${outputDir}`);
