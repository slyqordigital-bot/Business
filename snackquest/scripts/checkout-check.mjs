// Live check of the in-page checkout (never pays): a new account opens /pricing, then each plan × period;
// reads the price Whop shows inside the sheet, then tries the return page with an unpaid ref.
// usage: BASE_URL=https://… node scripts/checkout-check.mjs
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.env.BASE_URL || "http://localhost:3000";
const domain = new URL(base).hostname.split(".")[0];
fs.mkdirSync("shots/checkout", { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};
const b = await chromium.launch(exe);
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const email = `paycheck+${Date.now()}@${domain}-test.com`;
await p.goto(base + "/signup");
await p.getByPlaceholder("Email").fill(email);
await p.getByPlaceholder("Password").fill("Pay-check-2026!");
await p.getByTestId("auth-submit").click();
await p.waitForTimeout(4000);
await p.goto(base + "/pricing", { waitUntil: "networkidle" });
let refs = [];
p.on("response", async (r) => { if (r.url().endsWith("/api/checkout") && r.request().method() === "POST") { try { const j = await r.json(); refs.push(j.ref); } catch {} } });
for (const period of ["Monthly", "Yearly"]) {
  const tab = p.getByRole("tab", { name: new RegExp(period) });
  if (await tab.count()) await tab.first().click();
  for (const lvl of [1, 2, 3]) {
    const row = p.getByTestId(`top-plan-${lvl}`);
    if (!(await row.count())) { console.log(period, lvl, "no plan row"); continue; }
    const rowText = (await row.innerText()).replace(/\s+/g, " ");
    await row.click();
    const t0 = Date.now();
    await p.getByTestId("paywall-continue").click();
    await p.getByTestId("checkout-sheet").waitFor();
    let shown = "";
    for (let i = 0; i < 40 && !shown; i++) {
      await p.waitForTimeout(500);
      for (const f of p.frames()) {
        if (!/whop/.test(f.url())) continue;
        const txt = await f.locator("body").innerText().catch(() => "");
        const m = txt.match(/\$[\d,.]+\s*(?:\n|\s)*(?:per|\/)\s*\w+/i) || txt.match(/\$[\d,.]+/);
        if (m && /subscribe|pay|card/i.test(txt)) shown = m[0].replace(/\s+/g, " ");
      }
    }
    if (lvl === 2 && period === "Monthly") {
      for (const f of p.frames()) {
        if (!/whop/.test(f.url())) continue;
        const inp = f.locator('input[type="email"], input[name*="email" i], input[autocomplete="email"]').first();
        if (await inp.count()) console.log("  Whop email field:", JSON.stringify(await inp.inputValue()), "| editable:", await inp.isEditable().catch(() => "?"));
        const txt = await f.locator("body").innerText().catch(() => "");
        if (txt.includes(email)) console.log("  account email shown in Whop: yes");
      }
    }
    const title = (await p.getByTestId("checkout-sheet").locator("h3").innerText().catch(() => "")).replace(/\s+/g, " ");
    console.log(`${period.padEnd(7)} | row: ${rowText.slice(0, 60).padEnd(60)} | sheet: ${title.padEnd(40)} | Whop shows: ${shown || "NOTHING"} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    await p.screenshot({ path: `shots/checkout/${domain}-${period}-${lvl}.png` });
    await p.keyboard.press("Escape");
    await p.waitForTimeout(600);
  }
}
// return page with an unpaid ref: must not unlock
const ref = refs.find(Boolean);
await p.goto(`${base}/dashboard?paid=1&ref=${encodeURIComponent(ref)}`);
await p.waitForTimeout(6000);
const body = (await p.locator("body").innerText()).replace(/\s+/g, " ");
console.log("return page with unpaid ref →", p.url().replace(base, ""), "|", /confirming|try again/i.test(body) ? "shows 'confirming your payment', no unlock" : body.slice(0, 160));
const conf = await p.evaluate(async (r) => (await fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: r }) })).json(), ref);
console.log("confirm API with unpaid ref →", JSON.stringify(conf));
console.log("test account:", email, "| page errors:", errors.length ? errors : "none");
await b.close();
