// Full-page screenshots at 390×844 and 1440×900, plus console errors.
// usage: node scripts/shot.mjs [path ...]   (BASE_URL defaults to http://localhost:3000)
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const out = process.env.SHOT_DIR || "shots";
fs.mkdirSync(out, { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const browser = await chromium.launch(exe);
let errors = 0;
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("console", (m) => { if (m.type() === "error") { errors++; console.log(`[console ${w}] ${m.text()}`); } });
  page.on("pageerror", (e) => { errors++; console.log(`[pageerror ${w}] ${e.message}`); });
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += h / 2) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    const name = `${out}/${p.replace(/[/?=&]+/g, "_") || "_"}-${w}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log("saved", name);
  }
  await page.close();
}
await browser.close();
console.log(errors ? `${errors} console errors` : "0 console errors");
