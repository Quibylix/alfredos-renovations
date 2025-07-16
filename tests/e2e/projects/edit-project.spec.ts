import { expect, test } from "@playwright/test";
import {
  getTextboxByName,
  getButtonByName,
  getTextByContent,
  getHeadingByContent,
  getLinkByContent,
} from "../shared/get-elements.util";
import es from "@/features/i18n/messages/es.json";
import { getAuthStatePath } from "../auth/get-auth-state-path.util";
import { users } from "../seed/data/users.constant";
import { AppRoutes } from "@/features/shared/app-routes.util";
import { readFileSync } from "fs";
import path from "path";
import { StoredProjectData } from "../seed/register-projects";
import { createTranslator } from "next-intl";

const { title: NOT_FOUND_TITLE } = es.notFound;

const t = createTranslator({
  messages: es,
  locale: "es",
});

let projects: StoredProjectData;

test.describe("Edit project", () => {
  test.beforeAll(async ({}) => {
    projects = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/projects.json"),
        "utf-8",
      ),
    );
  });

  test.describe("When not authenticated", () => {
    test("should redirect to login page", async ({ page }) => {
      await page.goto(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects.projectToEdit.id.toString(),
        }),
      );

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
      await page.goto(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects.projectToEdit.id.toString(),
        }),
      );

      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("HOME"),
      );
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthStatePath(users.bossWhoEditsProjects.username),
    });

    test.beforeEach(async ({ page }) => {
      await page.goto(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects.projectToEdit.id.toString(),
        }),
      );
    });

    test("should display a not found error if project does not exist", async ({
      page,
    }) => {
      await page.goto(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects.projectToEdit.id.toString() + "invalid",
        }),
      );

      await expect(getTextByContent(page, NOT_FOUND_TITLE)).toBeVisible();
    });

    test("should display the form", async ({ page }) => {
      const titleInput = getTextboxByName(
        page,
        t("editProject.form.title.label"),
      );

      await expect(titleInput).toBeVisible();
    });

    test("should display an error if the title is empty", async ({ page }) => {
      const titleInput = getTextboxByName(
        page,
        t("editProject.form.title.label"),
      );

      await titleInput.fill("");
      await getButtonByName(page, t("editProject.form.submit")).click();

      expect(
        await titleInput.evaluate((el: HTMLInputElement) => el.checkValidity()),
      ).toBe(false);
    });

    test("should display an error if the title is spaces only", async ({
      page,
    }) => {
      const titleInput = getTextboxByName(
        page,
        t("editProject.form.title.label"),
      );

      await titleInput.fill("  ");
      await getButtonByName(page, t("editProject.form.submit")).click();

      await expect(
        getTextByContent(page, t("editProject.form.title.isRequired")),
      ).toBeVisible();
    });

    test("should allow enter to the edit page through project page", async ({
      page,
    }) => {
      await page.goto(
        AppRoutes.getRoute("PROJECT", {
          id: projects.projectToEdit.id.toString(),
        }),
      );

      await getLinkByContent(page, t("project.edit")).click();

      await expect(page).toHaveURL(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects.projectToEdit.id.toString(),
        }),
      );
    });

    test("should initially display the project title", async ({ page }) => {
      const titleInput = getTextboxByName(
        page,
        t("editProject.form.title.label"),
      );

      await expect(titleInput).toHaveValue(projects.projectToEdit.title);
    });

    test("should edit the project", async ({ page }, { project }) => {
      await page.goto(
        AppRoutes.getRoute("EDIT_PROJECT", {
          id: projects[
            `projectToEdit-${project.name}` as keyof typeof projects
          ].id.toString(),
        }),
      );

      const titleInput = getTextboxByName(
        page,
        t("editProject.form.title.label"),
      );

      await titleInput.fill("Edited Project " + project.name);

      await getButtonByName(page, t("editProject.form.submit")).click();

      await expect(page).toHaveURL(
        AppRoutes.getRoute("PROJECT", {
          id: projects[
            `projectToEdit-${project.name}` as keyof typeof projects
          ].id.toString(),
        }),
      );
      await expect(
        getHeadingByContent(page, `Edited Project ${project.name}`),
      ).toBeVisible();
    });
  });
});
