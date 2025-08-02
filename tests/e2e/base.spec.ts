import { test, expect } from "@playwright/test";
import es from "@/features/i18n/messages/es.json";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";

test("page has title", async ({ page }) => {
  await page.goto(AppRoutes.getRoute("HOME"));

  await expect(page).toHaveTitle(es.layout.title);
});
