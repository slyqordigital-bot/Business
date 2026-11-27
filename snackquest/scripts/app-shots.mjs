// Dev only: screenshots of the paid app as DEV_PAID_EMAIL (see lib/kwop.ts), at 390 and 1440.
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3000";
const email = "devpreview@snackquest-test.com", pw = "Snack-quest-2026!";
fs.mkdirSync("shots", { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
let errors = 0;
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => { errors++; console.log("[pageerror]", e.message); });
  p.on("console", (m) => { if (m.type() === "error") { errors++; console.log("[console]", m.text()); } });
  await p.goto(base + "/login");
  await p.getByPlaceholder("Email").fill(email);
  await p.getByPlaceholder("Password").fill(pw);
  await p.getByTestId("auth-submit").click();
  await p.waitForTimeout(2500);
  if (p.url().includes("/login")) {
    await p.goto(base + "/signup");
    await p.getByPlaceholder("Email").fill(email);
    await p.getByPlaceholder("Password").fill(pw);
    await p.getByTestId("auth-submit").click();
    await p.waitForURL(/start/);
  }
  const has = await p.evaluate(async () => (await (await fetch("/api/run")).json()).run);
  if (!has) {
    const r = await p.evaluate(async () => (await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: { game: "Valorant", snack: "Chips", when: "After school or work", goal: "Controller", tag: "ChipClutch42" } }) })).status);
    console.log("run", r);
  }
  for (const path of process.argv.slice(2).length ? process.argv.slice(2) : ["/dashboard", "/quests", "/rewards", "/profile", "/account"]) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `shots/app${path.replace(/\//g, "_")}-${w}.png`, fullPage: true });
    console.log("saved", path, w);
  }
  await ctx.close();
}
await b.close();
console.log(errors ? `${errors} errors` : "0 console errors");
