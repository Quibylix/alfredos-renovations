import { expect, Page, test } from "@playwright/test";
import es from "@/features/i18n/messages/es.json";
import path from "path";
import { users } from "../users.constant";

const LOGIN_URL = "/auth/login";
const HOME_URL = "/";

const {
  form: {
    title: { label: TITLE_LABEL, isRequired: TITLE_REQUIRED_MSG },
    employees: { label: EMPLOYEES_LABEL },
    submit: SUBMIT_LABEL,
  },
  success: SUCCESS_MSG,
} = es.createProject;

const getTextboxByName = (page: Page, name: string) =>
  page.getByRole("textbox", {
    name,
    exact: true,
  });

const getListboxByName = (page: Page, name: string) =>
  page.getByRole("listbox", {
    name,
    exact: true,
  });

const getButtonByName = (page: Page, name: string) =>
  page.getByRole("button", {
    name,
    exact: true,
  });

const getTextByContent = (page: Page, content: string) =>
  page.getByText(content, { exact: true }).first();

const getAuthResolvePath = (username: string) =>
  path.resolve(__dirname, `../.auth/${username}.json`);

test.describe("Create project", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/projects/create");
  });

  test.describe("When not authenticated", () => {
    test("should redirect to login page", async ({ page }) => {
      await expect(page).toHaveURL((url) => url.pathname === LOGIN_URL);
    });
  });

  test.describe("When logged in as employee", () => {
    test.use({
      storageState: getAuthResolvePath(users.employee1.username),
    });

    test("should redirect to home page", async ({ page }) => {
      await expect(page).toHaveURL((url) => url.pathname === HOME_URL);
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthResolvePath(users.bossWhoCreatesProjects.username),
    });

    test("should display the form", async ({ page }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);
      const employeesInput = getTextboxByName(page, EMPLOYEES_LABEL);
      const employeesList = getListboxByName(page, EMPLOYEES_LABEL);

      await expect(titleInput).toBeVisible();
      await expect(employeesInput).toBeVisible();

      await employeesInput.click();
      await expect(employeesList).toBeVisible();
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

    test("should create a new project", async ({ page }, { workerIndex }) => {
      const titleInput = getTextboxByName(page, TITLE_LABEL);
      const employeesInput = getTextboxByName(page, EMPLOYEES_LABEL);
      const employeesList = getListboxByName(page, EMPLOYEES_LABEL);

      await titleInput.fill("Project " + workerIndex);
      await employeesInput.click();
      await employeesList
        .getByRole("option")
        .filter({ hasText: users.employee1.fullName })
        .click();
      await employeesInput.blur();

      await getButtonByName(page, SUBMIT_LABEL).click();

      await expect(getTextByContent(page, SUCCESS_MSG)).toBeVisible();
    });
  });
});
