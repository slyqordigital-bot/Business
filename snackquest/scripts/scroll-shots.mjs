// Viewport screenshots while scrolling like a person (checks sticky bars, reveals, live animations).
// usage: node scripts/scroll-shots.mjs [path] (BASE_URL defaults to http://localhost:3000)
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3000";
const path = process.argv[2] || "/";
fs.mkdirSync("shots/scroll", { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch(exe);
let errors = 0;
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => { errors++; console.log("[pageerror]", e.message); });
  p.on("console", (m) => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
  await p.goto(base + path, { waitUntil: "networkidle" });
  const total = await p.evaluate(() => document.body.scrollHeight);
  let n = 0;
  for (const y of [0, 0, Math.round(h * 1.2), Math.round(total * 0.35), Math.round(total * 0.6), total]) {
    await p.mouse.wheel(0, 0);
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await p.waitForTimeout(n === 0 ? 300 : 1400);
    await p.screenshot({ path: `shots/scroll/${w}-${n++}.png` });
  }
  await p.close();
}
await b.close();
console.log(errors ? `${errors} errors` : "0 console errors");
