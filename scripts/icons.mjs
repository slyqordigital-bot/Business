import { chromium } from "playwright";
import fs from "node:fs";
const svg = fs.readFileSync("./app/icon.svg", "utf8");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [size, out, pad] of [[192, "public/icon-192.png", 0], [512, "public/icon-512.png", 0], [180, "app/apple-icon.png", 0]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:#07060D">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `).replace('rx="9"', out.includes("apple") || out.includes("512") ? 'rx="0"' : 'rx="9"')}</body></html>`);
  await p.screenshot({ path: "./" + out, omitBackground: false });
}
await b.close();
