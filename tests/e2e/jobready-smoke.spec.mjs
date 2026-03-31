import { test, expect } from "@playwright/test";

test("jobready marketing and auth entry points render", async ({ page }) => {
  await page.goto("/jobready");
  await expect(page.getByRole("heading", { name: /career tools that feel enterprise-grade/i })).toBeVisible();
  await page.getByRole("link", { name: /start your workspace/i }).click();
  await expect(page).toHaveURL(/\/jobready\/signup$/);
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
});
