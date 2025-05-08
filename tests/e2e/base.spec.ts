import { test, expect } from "@playwright/test";
import es from "@/features/i18n/messages/es.json";

test("page has title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(es.layout.title);
});
