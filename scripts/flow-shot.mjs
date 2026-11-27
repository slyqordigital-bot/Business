// Captures the try-first funnel states with a mocked AI answer (dev check only, never shipped).
import { chromium } from "playwright";
const out = process.env.SHOT_DIR || "shots";
const base = process.env.BASE_URL || "http://localhost:3000";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.route("**/api/try", async (r) => { await new Promise((x) => setTimeout(x, 1500)); r.fulfill({ json: { id: null, dish: "chicken burrito bowl", insight: "Most of the protein comes from the grilled chicken.", confidence: "high",
    items: [{ name: "white rice", x: .3, y: .3 }, { name: "grilled chicken", x: .7, y: .3 }, { name: "avocado", x: .3, y: .72 }, { name: "broccoli", x: .72, y: .66 }, { name: "black beans", x: .5, y: .85 }] } }); });
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => localStorage.clear());
  await p.click('[data-testid="example-poke-bowl"]');
  await p.waitForSelector('[data-testid="working"]');
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/flow-working-${w}.png` });
  await p.waitForSelector('[data-testid="teaser"]', { timeout: 15000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/flow-teaser-${w}.png` });
  await p.click('[data-testid="unlock"]');
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/flow-signup-${w}.png` });
  await p.close();
}
await b.close();
