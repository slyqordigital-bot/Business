import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [s, out, pad] of [[192, "public/icon-192.png", 0], [512, "public/icon-512.png", 0], [180, "app/apple-icon.png", 0]]) {
  const p = await b.newPage({ viewport: { width: s, height: s } });
  await p.setContent(`<body style="margin:0;background:#E5482F"><img src="data:image/svg+xml;base64,${Buffer.from(await (await import("node:fs")).promises.readFile("public/logo.svg")).toString("base64")}" style="width:${s}px;height:${s}px;display:block;padding:${pad}px"></body>`);
  await p.screenshot({ path: out });
}
await b.close();
