import { test, expect } from "@playwright/test";

/**
 * The whole personal-flow funnel as a brand-new visitor, for real (real accounts, real AI, real Kwop checkout; never pays):
 * landing → sign-up (new email) → 4 questions → gamer tag → the work → locked result → paywall → checkout sheet → close → account.
 * Needs a running app with Supabase, GEMINI_API_KEY and KWOP_API configured.
 */
test("personal-flow funnel", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Unlock real gear");
  await page.getByTestId("hero-cta").click();
  await expect(page).toHaveURL(/\/signup/);

  const email = `e2e+${Date.now()}${Math.floor(Math.random() * 1000)}@snackquest-test.com`;
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("Snack-quest-2026!");
  await page.getByTestId("auth-submit").click();
  await expect(page).toHaveURL(/\/start/, { timeout: 30_000 });

  for (const opt of ["Fortnite", "Pizza", "Late night", "Headset"]) {
    await page.getByTestId(`opt-${opt}`).click();
  }
  await expect(page.getByTestId("tag-input")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("build-quest").click();
  await expect(page.getByTestId("work")).toBeVisible();
  await expect(page.getByTestId("result")).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId("quest-card").first()).toBeVisible();
  await expect(page.getByTestId("locked-quests")).toBeVisible();

  await expect(page.getByTestId("paywall-title")).toContainText("Fortnite × pizza quest is ready.", { timeout: 15_000 });
  await expect(page.getByTestId("top-plan-2")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("paywall-continue").click();
  await expect(page.getByTestId("checkout-sheet")).toBeVisible();
  await expect(page.locator("#whop-checkout iframe")).toBeAttached({ timeout: 25_000 });

  await page.keyboard.press("Escape"); // closes the checkout sheet
  await page.keyboard.press("Escape"); // closes the paywall
  await expect(page.getByTestId("sticky-unlock")).toBeVisible();

  // a returning visitor lands on their locked result
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/start/);
  await expect(page.getByTestId("result")).toBeVisible();

  await page.goto("/account");
  await expect(page.getByTestId("billing")).toContainText("Free account");
  expect(errors).toEqual([]);
});
