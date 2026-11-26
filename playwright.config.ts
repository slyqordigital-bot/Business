import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

const exe = fs.existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {};

export default defineConfig({
  testDir: "tests",
  timeout: 120_000,
  retries: 0,
  use: { baseURL: process.env.BASE_URL || "http://localhost:3000", trace: "off", launchOptions: exe },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], launchOptions: exe } },
    { name: "computer", use: { viewport: { width: 1440, height: 900 }, launchOptions: exe } },
  ],
});
