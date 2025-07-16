import { AppRoutes } from "@/features/shared/app-routes.util";
import { test, expect } from "@playwright/test";
import { getAuthStatePath } from "../auth/get-auth-state-path.util";
import {
  getButtonByName,
  getByLabel,
  getListboxByName,
  getOptionByName,
  getTextboxByName,
  getTextByContent,
} from "../shared/get-elements.util";
import { createTranslator } from "next-intl";
import es from "@/features/i18n/messages/es.json";
import { StoredProjectData } from "../seed/register-projects";
import { readFileSync } from "fs";
import path from "path";
import { StoredUserData } from "../seed/register-users";

const t = createTranslator({
  messages: es,
  locale: "es",
  namespace: "setTask",
});

let projects: StoredProjectData, users: StoredUserData;

const formatDate = (date: Date) => {
  return `${date.getDate()} ${date.toLocaleString("en-US", {
    month: "long",
  })} ${date.getFullYear()}`;
};

test.describe("Set task", () => {
  test.beforeAll(async ({}) => {
    projects = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/projects.json"),
        "utf-8",
      ),
    );

    users = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/users.json"),
        "utf-8",
      ),
    );
  });

  test.describe("When not authenticated", () => {
    test("should redirect to login page", async ({ page }) => {
      await page.goto(AppRoutes.getRoute("SET_TASK"));

      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("LOGIN"),
      );
    });
  });

  test.describe("When logged in as employee", () => {
    test.use({
      storageState: getAuthStatePath("employee1"),
    });

    test("should redirect to home page", async ({ page }) => {
      await page.goto(AppRoutes.getRoute("SET_TASK"));

      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("HOME"),
      );
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthStatePath("bossWhoSetTasks"),
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(AppRoutes.getRoute("SET_TASK"));
    });

    test("should display the set task form first step", async ({ page }) => {
      await expect(
        getTextboxByName(page, t("form.project.label")),
      ).toBeVisible();
      await expect(getTextboxByName(page, t("form.title.label"))).toBeVisible();
      await expect(
        getTextboxByName(page, t("form.description.label")),
      ).toBeVisible();
      await expect(getByLabel(page, t("form.media.label"))).toBeVisible();
    });

    test("should display error messages when submitting empty form in first step", async ({
      page,
    }) => {
      await getTextboxByName(page, t("form.title.label")).fill("");
      await getTextboxByName(page, t("form.description.label")).fill("");

      await getButtonByName(page, t("form.steps.next")).click();

      await expect(
        getTextByContent(page, t("form.project.isRequired")),
      ).toBeVisible();
      await expect(
        getTextByContent(page, t("form.title.isRequired")),
      ).toBeVisible();
      await expect(
        getTextByContent(page, t("form.description.isRequired")),
      ).toBeVisible();
    });

    test("should display the second step of the form", async ({ page }) => {
      await getTextboxByName(page, t("form.title.label")).click();
      await getTextboxByName(page, t("form.project.label")).click();

      await getOptionByName(
        getListboxByName(page, t("form.project.label")),
        projects.projectToSetTask.title,
      ).click();

      await getTextboxByName(page, t("form.title.label")).fill(
        "Set Task Title",
      );
      await getTextboxByName(page, t("form.description.label")).fill(
        "Set Task Description",
      );

      await getButtonByName(page, t("form.steps.next")).click();

      await expect(
        getButtonByName(page, t("form.dateRange.label")),
      ).toBeVisible();
    });

    test("should display error messages when submitting empty form in second step", async ({
      page,
    }) => {
      await getTextboxByName(page, t("form.title.label")).click();
      await getTextboxByName(page, t("form.project.label")).click();

      await getOptionByName(
        getListboxByName(page, t("form.project.label")),
        projects.projectToSetTask.title,
      ).click();

      await getTextboxByName(page, t("form.title.label")).fill(
        "Set Task Title",
      );
      await getTextboxByName(page, t("form.description.label")).fill(
        "Set Task Description",
      );
      await getButtonByName(page, t("form.steps.next")).click();

      await getButtonByName(page, t("form.steps.next")).click();

      await expect(
        getTextByContent(page, t("form.dateRange.isRequired")),
      ).toBeVisible();
    });

    test("should display the third step of the form", async ({ page }) => {
      await getTextboxByName(page, t("form.title.label")).click();

      await getTextboxByName(page, t("form.project.label")).click();
      await getOptionByName(
        getListboxByName(page, t("form.project.label")),
        projects.projectToSetTask.title,
      ).click();

      await getTextboxByName(page, t("form.title.label")).fill(
        "Set Task Title",
      );
      await getTextboxByName(page, t("form.description.label")).fill(
        "Set Task Description",
      );

      await getButtonByName(page, t("form.steps.next")).click();

      await getButtonByName(page, t("form.dateRange.label")).click();

      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

      await getButtonByName(page, today).click();
      await getButtonByName(page, tomorrow).click();

      await getButtonByName(page, t("form.steps.next")).click();

      await expect(
        getTextboxByName(page, t("form.employees.label")),
      ).toBeVisible();

      await expect(getButtonByName(page, t("form.submit"))).toBeVisible();
    });

    test("should display error messages when submitting empty form in third step", async ({
      page,
    }) => {
      await getTextboxByName(page, t("form.title.label")).click();
      await getTextboxByName(page, t("form.project.label")).click();
      await getOptionByName(
        getListboxByName(page, t("form.project.label")),
        projects.projectToSetTask.title,
      ).click();
      await getTextboxByName(page, t("form.title.label")).fill(
        "Set Task Title",
      );
      await getTextboxByName(page, t("form.description.label")).fill(
        "Set Task Description",
      );

      await getButtonByName(page, t("form.steps.next")).click();

      await getButtonByName(page, t("form.dateRange.label")).click();

      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

      await getButtonByName(page, today).click();
      await getButtonByName(page, tomorrow).click();

      await getButtonByName(page, t("form.steps.next")).click();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("form.employees.isRequired")),
      ).toBeVisible();
    });

    test("should submit the form and display success message", async ({
      page,
    }, { project }) => {
      await getTextboxByName(page, t("form.title.label")).click();
      await getTextboxByName(page, t("form.project.label")).click();
      await getOptionByName(
        getListboxByName(page, t("form.project.label")),
        projects.projectToSetTask.title,
      ).click();
      await getTextboxByName(page, t("form.title.label")).fill(
        "Set Task Title " + project.name,
      );
      await getTextboxByName(page, t("form.description.label")).fill(
        "Set Task Description",
      );

      await getButtonByName(page, t("form.steps.next")).click();

      await getButtonByName(page, t("form.dateRange.label")).click();

      const today = formatDate(new Date());
      const tomorrow = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

      await getButtonByName(page, today).click();
      await getButtonByName(page, tomorrow).click();

      await getButtonByName(page, t("form.steps.next")).click();

      await getTextboxByName(page, t("form.employees.label")).click();
      await getOptionByName(
        getListboxByName(page, t("form.employees.label")),
        users.employeeAssignedToTasks.fullName,
      ).click();
      await getTextboxByName(page, t("form.employees.label")).blur();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();

      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("TASK_LIST"),
      );

      await expect(
        getTextByContent(page, "Set Task Title " + project.name),
      ).toBeVisible();
    });
  });
});
