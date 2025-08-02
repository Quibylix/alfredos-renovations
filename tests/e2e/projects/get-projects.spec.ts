import { expect, test } from "@playwright/test";
import { getHeadingByContent } from "../shared/get-elements.util";
import { getAuthStatePath } from "../auth/get-auth-state-path.util";
import { users } from "../seed/data/users.constant";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { taskAssignments } from "../seed/data/tasks.constant";
import { StoredTaskData } from "../seed/register-tasks";
import { readFileSync } from "fs";
import path from "path";
import { StoredProjectData } from "../seed/register-projects";

let tasks: StoredTaskData;
let projects: StoredProjectData;

test.describe("Get projects", () => {
  test.beforeAll(async ({}) => {
    tasks = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/tasks.json"),
        "utf-8",
      ),
    );

    projects = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/projects.json"),
        "utf-8",
      ),
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(AppRoutes.getRoute("PROJECT_LIST"));
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

    test("should display projects with a task assigned to the employee", async ({
      page,
    }) => {
      const data = taskAssignments.filter(
        (taskAssignment) => taskAssignment.employee === "employee1",
      );

      await Promise.all(
        data.map((taskAssignment) => {
          const task = tasks[taskAssignment.task];
          const projectTitle = Object.values(projects).find(
            (project) => project.id === task.projectId,
          )!.title;

          return expect(getHeadingByContent(page, projectTitle)).toBeVisible();
        }),
      );
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthStatePath(users.boss.username),
    });

    test("should display all projects", async ({ page }) => {
      const projectTitles = [projects.project1.title, projects.project2.title];

      await Promise.all(
        projectTitles.map((title) => {
          return expect(getHeadingByContent(page, title)).toBeVisible();
        }),
      );
    });
  });
});
