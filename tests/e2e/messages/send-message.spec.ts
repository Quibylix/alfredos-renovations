import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { test, expect } from "@playwright/test";
import { getAuthStatePath } from "../auth/get-auth-state-path.util";
import {
  getButtonByName,
  getByLabel,
  getTextboxByName,
  getTextByContent,
} from "../shared/get-elements.util";
import { createTranslator } from "next-intl";
import es from "@/features/i18n/messages/es.json";
import { readFileSync } from "fs";
import path from "path";
import { StoredUserData } from "../seed/register-users";
import { StoredTaskData } from "../seed/register-tasks";

const t = createTranslator({
  messages: es,
  locale: "es",
  namespace: "sendMessage",
});

let users: StoredUserData, tasks: StoredTaskData;

test.describe("Send message", () => {
  test.beforeAll(async ({}) => {
    users = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/users.json"),
        "utf-8",
      ),
    );

    tasks = JSON.parse(
      readFileSync(
        path.resolve(__dirname, "../seed/.data/tasks.json"),
        "utf-8",
      ),
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(
      AppRoutes.getRoute("SEND_MESSAGE") +
        "?taskId=" +
        tasks.taskToInsertMessages.id,
    );
  });

  test.describe("When not authenticated", () => {
    test("should redirect to login page", async ({ page }) => {
      await expect(page).toHaveURL(
        (url) => url.pathname === AppRoutes.getRoute("LOGIN"),
      );
    });
  });

  test.describe("When logged in as employee who is not assigned to the task", () => {
    test.use({
      storageState: getAuthStatePath("employee1"),
    });

    test("should redirect to home page", async ({ page }) => {
      await expect(getTextByContent(page, es.notFound.message)).toBeVisible();
    });
  });

  test.describe("When logged in as employee", () => {
    test.use({
      storageState: getAuthStatePath("employeeWhoSendsMessages"),
    });

    test("should display display the message form", async ({ page }) => {
      await expect(
        getTextboxByName(page, t("form.content.label")),
      ).toBeVisible();
      await expect(getByLabel(page, t("form.media.label"))).toBeVisible();
    });

    test("should display error message when submitting empty form", async ({
      page,
    }) => {
      await getButtonByName(page, t("form.submit")).click();
      await expect(
        getTextByContent(page, t("api.message.noData")),
      ).toBeVisible();
    });

    test("should send a message if only content is provided", async ({ page }, {
      project,
    }) => {
      const messageContent = "Sending an employee test message " + project.name;

      await getTextboxByName(page, t("form.content.label")).fill(
        messageContent,
      );
      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
      await expect(getTextByContent(page, messageContent)).toBeVisible();
    });

    test("should send a message if only media is provided", async ({
      page,
    }) => {
      const mediaFilePath = path.resolve(
        __dirname,
        "../seed/data/test-image.png",
      );

      const fileChooserPromise = page.waitForEvent("filechooser");
      await expect(getByLabel(page, t("form.media.label"))).not.toBeDisabled();
      await getByLabel(page, t("form.media.label")).click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(mediaFilePath);

      await expect(
        getTextByContent(page, es.uploadMedia.success),
      ).toBeVisible();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
    });

    test("should send a message with both content and media", async ({ page }, {
      project,
    }) => {
      const messageContent =
        "Sending an employee test message with media " + project.name;
      const mediaFilePath = path.resolve(
        __dirname,
        "../seed/data/test-image.png",
      );

      const fileChooserPromise = page.waitForEvent("filechooser");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await getTextboxByName(page, t("form.content.label")).fill(
        messageContent,
      );
      await expect(getByLabel(page, t("form.media.label"))).not.toBeDisabled();
      await getByLabel(page, t("form.media.label")).click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(mediaFilePath);

      await expect(
        getTextByContent(page, es.uploadMedia.success),
      ).toBeVisible();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
      await expect(getTextByContent(page, messageContent)).toBeVisible();
    });
  });

  test.describe("When logged in as boss", () => {
    test.use({
      storageState: getAuthStatePath("bossWhoSendsMessages"),
    });

    test("should display display the message form", async ({ page }) => {
      await expect(
        getTextboxByName(page, t("form.content.label")),
      ).toBeVisible();
      await expect(getByLabel(page, t("form.media.label"))).toBeVisible();
    });

    test("should display error message when submitting empty form", async ({
      page,
    }) => {
      await getButtonByName(page, t("form.submit")).click();
      await expect(
        getTextByContent(page, t("api.message.noData")),
      ).toBeVisible();
    });

    test("should send a message if only content is provided", async ({ page }, {
      project,
    }) => {
      const messageContent = "Sending a boss test message " + project.name;

      await getTextboxByName(page, t("form.content.label")).fill(
        messageContent,
      );
      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
      await expect(getTextByContent(page, messageContent)).toBeVisible();
    });

    test("should send a message if only media is provided", async ({
      page,
    }) => {
      const mediaFilePath = path.resolve(
        __dirname,
        "../seed/data/test-image.png",
      );

      const fileChooserPromise = page.waitForEvent("filechooser");
      await expect(getByLabel(page, t("form.media.label"))).toBeEnabled();
      await getByLabel(page, t("form.media.label")).click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(mediaFilePath);

      await expect(
        getTextByContent(page, es.uploadMedia.success),
      ).toBeVisible();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
    });

    test("should send a message with both content and media", async ({ page }, {
      project,
    }) => {
      const messageContent =
        "Sending a boss test message with media " + project.name;
      const mediaFilePath = path.resolve(
        __dirname,
        "../seed/data/test-image.png",
      );

      await getTextboxByName(page, t("form.content.label")).fill(
        messageContent,
      );

      const fileChooserPromise = page.waitForEvent("filechooser");
      await expect(getByLabel(page, t("form.media.label"))).toBeEnabled();
      await getByLabel(page, t("form.media.label")).click();

      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(mediaFilePath);

      await expect(
        getTextByContent(page, es.uploadMedia.success),
      ).toBeVisible();

      await getButtonByName(page, t("form.submit")).click();

      await expect(
        getTextByContent(page, t("api.message.success")),
      ).toBeVisible();
      await expect(getTextByContent(page, messageContent)).toBeVisible();
    });
  });
});
