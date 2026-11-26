import { chromium } from "playwright";
const [, , ...files] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 800, height: 800 } });
for (const f of files) {
  await p.goto("file://" + f);
  await p.screenshot({ path: f.replace(/\.svg$/, ".png") });
}
await b.close();
