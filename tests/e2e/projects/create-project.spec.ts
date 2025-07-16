import { expect, test } from "@playwright/test";
import {
  getTextboxByName,
  getButtonByName,
  getTextByContent,
  getHeadingByContent,
} from "../shared/get-elements.util";
import es from "@/features/i18n/messages/es.json";
import { getAuthStatePath } from "../auth/get-auth-state-path.util";
import { users } from "../seed/data/users.constant";
import { AppRoutes } from "@/features/shared/app-routes.util";

const {
  form: {
    title: { label: TITLE_LABEL, isRequired: TITLE_REQUIRED_MSG },
    submit: SUBMIT_LABEL,
  },
} = es.createProject;

test.describe("Create project", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AppRoutes.getRoute("CREATE_PROJECT"));
  });

  test.describe("When not authenticated", () => {
    test("should redirect to login page", async ({ page }) => {
      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("LOGIN"),
      );
    });
  });

  test.describe("When logged in as employee", () => {
    test.use({
      storageState: getAuthStatePath(users.employee1.username),
    });

    test("should redirect to home page", async ({ page }) => {
      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("HOME"),
      );
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthStatePath(users.bossWhoCreatesProjects.username),
    });

    test("should display the form", async ({ page }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);

      await expect(titleInput).toBeVisible();
    });

    test("should display an error if the title is empty", async ({ page }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);

      await titleInput.fill("");
      await getButtonByName(page, SUBMIT_LABEL).click();

      expect(
        await titleInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      ).toBe(false);
    });

    test("should display an error if the title is spaces only", async ({
      page,
    }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);

      await titleInput.fill("  ");
      await getButtonByName(page, SUBMIT_LABEL).click();

      await expect(getTextByContent(page, TITLE_REQUIRED_MSG)).toBeVisible();
    });

    test("should create a new project", async ({ page }, { project }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);

      await titleInput.fill("Created Project " + project.name);

      await getButtonByName(page, SUBMIT_LABEL).click();

      await expect(page).toHaveURL(AppRoutes.getRoute("PROJECT_LIST"));
      await expect(
        getHeadingByContent(page, "Created Project " + project.name),
      ).toBeVisible();
    });
  });
});
