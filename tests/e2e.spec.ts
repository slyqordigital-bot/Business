import { test, expect } from "@playwright/test";

/**
 * The whole funnel as a brand-new visitor, for real (real AI, real accounts, real Kwop checkout; never pays):
 * landing → example plate → the work → locked result → sign-up (new email) → paywall → checkout sheet → close → account.
 * Needs a running app with Supabase, GEMINI_API_KEY and KWOP_API configured.
 */
test("try-first funnel", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Snap your plate");
  await page.getByTestId("example-chicken-bowl").click();
  await expect(page.getByTestId("working")).toBeVisible();
  await expect(page.getByTestId("teaser")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("locked-numbers")).toBeVisible();

  await page.getByTestId("unlock").click();
  await expect(page.getByTestId("signup-sheet")).toBeVisible();
  const email = `e2e+${Date.now()}@macrosnap-test.com`;
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("Snap-macros-2026!");
  await page.getByTestId("auth-submit").click();

  await expect(page.getByTestId("paywall-title")).toHaveText("Your plate's macros are ready.", { timeout: 30_000 });
  await expect(page.getByTestId("top-plan-2")).toHaveAttribute("aria-checked", "true");
  await page.getByTestId("paywall-continue").click();
  await expect(page.getByTestId("checkout-sheet")).toBeVisible();
  await expect(page.locator("#whop-checkout iframe")).toBeAttached({ timeout: 20_000 });

  await page.keyboard.press("Escape"); // closes the checkout sheet
  await page.keyboard.press("Escape"); // closes the paywall
  await page.goto("/account");
  await expect(page.getByTestId("billing")).toContainText("Free account");
  await page.goto("/today");
  await expect(page.getByTestId("meal-unlock")).toBeVisible();
  expect(errors).toEqual([]);
});
