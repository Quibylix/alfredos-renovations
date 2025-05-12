import { expect, test } from "@playwright/test";
import es from "@/features/i18n/messages/es.json";
import path from "path";

test.describe("Register employee", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register-employee");
  });

  test("should redirect to login page if user is not authenticated", async ({
    page,
  }) => {
    const loginUrl = "/auth/login";

    await expect(page).toHaveURL((url) => {
      return url.pathname === loginUrl;
    });
  });

  test.describe("As an employee", () => {
    test.use({
      storageState: path.resolve(__dirname, "../.auth/employee1.json"),
    });

    test("should redirect to home page if user is an employee", async ({
      page,
    }) => {
      const homeUrl = "/";

      await expect(page).toHaveURL((url) => {
        return url.pathname === homeUrl;
      });
    });
  });

  test.describe("As a boss", () => {
    test.use({ storageState: path.resolve(__dirname, "../.auth/boss.json") });

    test("should display the registration form", async ({ page }) => {
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const usernameLabel = es.registerEmployee.form.username.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      await expect(
        page.getByRole("textbox", { name: usernameLabel, exact: true }),
      ).toBeVisible();

      await expect(
        page.getByRole("textbox", { name: fullNameLabel, exact: true }),
      ).toBeVisible();

      await expect(
        page.getByRole("textbox", { name: passwordLabel, exact: true }),
      ).toBeVisible();

      await expect(
        page.getByRole("textbox", { name: confirmPasswordLabel, exact: true }),
      ).toBeVisible();
    });

    test("should display an error if the username is empty", async ({
      page,
    }) => {
      const usernameLabel = es.registerEmployee.form.username.label;
      const buttonLabel = es.registerEmployee.form.submit;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });

      await usernameInput.fill("");
      await page.getByRole("button", { name: buttonLabel }).click();

      expect(
        await usernameInput.evaluate((el: HTMLInputElement) =>
          el.checkValidity(),
        ),
      ).toBe(false);
    });

    test("should display an error if the full name is empty", async ({
      page,
    }) => {
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const buttonLabel = es.registerEmployee.form.submit;

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
        exact: true,
      });

      await fullNameInput.fill("");
      await page.getByRole("button", { name: buttonLabel }).click();

      expect(
        await fullNameInput.evaluate((el: HTMLInputElement) =>
          el.checkValidity(),
        ),
      ).toBe(false);
    });

    test("should display an error if the password is empty", async ({
      page,
    }) => {
      const passwordLabel = es.registerEmployee.form.password.label;
      const buttonLabel = es.registerEmployee.form.submit;

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });

      await passwordInput.fill("");
      await page.getByRole("button", { name: buttonLabel }).click();

      expect(
        await passwordInput.evaluate((el: HTMLInputElement) =>
          el.checkValidity(),
        ),
      ).toBe(false);
    });

    test("should display an error if the confirm password is empty", async ({
      page,
    }) => {
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;
      const buttonLabel = es.registerEmployee.form.submit;

      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await confirmPasswordInput.fill("");
      await page.getByRole("button", { name: buttonLabel }).click();

      expect(
        await confirmPasswordInput.evaluate((el: HTMLInputElement) =>
          el.checkValidity(),
        ),
      ).toBe(false);
    });

    test("should display an error if the trimmed username is too short", async ({
      page,
    }) => {
      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.username.minLength;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill(" ".repeat(4));
      await fullNameInput.fill("Full Name");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the trimmed username is too long", async ({
      page,
    }) => {
      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.username.maxLength;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill("a".repeat(21));
      await fullNameInput.fill("Full Name");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the username has invalid characters", async ({
      page,
    }) => {
      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.username.noSpecialChars;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill("user name");
      await fullNameInput.fill("Full Name");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the trimmed full name is too short", async ({
      page,
    }) => {
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const usernameLabel = es.registerEmployee.form.username.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.fullName.minLength;

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await fullNameInput.fill(" ".repeat(4));
      await usernameInput.fill("username");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the trimmed full name is too long", async ({
      page,
    }) => {
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const usernameLabel = es.registerEmployee.form.username.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.fullName.maxLength;

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await fullNameInput.fill("a".repeat(101));
      await usernameInput.fill("username");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the password is too short", async ({
      page,
    }) => {
      const passwordLabel = es.registerEmployee.form.password.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const usernameLabel = es.registerEmployee.form.username.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.password.minLength;

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await passwordInput.fill("a".repeat(5));
      await fullNameInput.fill("Full Name");
      await usernameInput.fill("username");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the password is too long", async ({
      page,
    }) => {
      const passwordLabel = es.registerEmployee.form.password.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const usernameLabel = es.registerEmployee.form.username.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.password.maxLength;

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });
      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await passwordInput.fill("a".repeat(101));
      await fullNameInput.fill("Full Name");
      await usernameInput.fill("username");
      await confirmPasswordInput.fill("Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the passwords do not match", async ({
      page,
    }) => {
      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.form.confirmPassword.notMatch;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill("username");
      await fullNameInput.fill("Full Name");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Different Password");

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should display an error if the username is already taken", async ({
      page,
    }) => {
      const takenUsername = "employee1";

      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const errorMessage = es.registerEmployee.api.message.usernameTaken;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });

      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill(takenUsername);
      await fullNameInput.fill("Full Name");
      await passwordInput.fill("Password");
      await confirmPasswordInput.fill("Password");
      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(errorMessage, { exact: true }).first(),
      ).toBeVisible();
    });

    test("should register a new employee", async ({ page }, {
      workerIndex,
    }) => {
      const username = "new-employee-" + workerIndex;
      const fullName = "New Employee";
      const password = "Password1234";

      const usernameLabel = es.registerEmployee.form.username.label;
      const fullNameLabel = es.registerEmployee.form.fullName.label;
      const passwordLabel = es.registerEmployee.form.password.label;
      const confirmPasswordLabel =
        es.registerEmployee.form.confirmPassword.label;

      const buttonLabel = es.registerEmployee.form.submit;

      const successMessage = es.registerEmployee.api.message.success;

      const usernameInput = page.getByRole("textbox", {
        name: usernameLabel,
        exact: true,
      });

      const fullNameInput = page.getByRole("textbox", {
        name: fullNameLabel,
      });

      const passwordInput = page.getByRole("textbox", {
        name: passwordLabel,
        exact: true,
      });
      const confirmPasswordInput = page.getByRole("textbox", {
        name: confirmPasswordLabel,
        exact: true,
      });

      await usernameInput.fill(username);
      await fullNameInput.fill(fullName);
      await passwordInput.fill(password);
      await confirmPasswordInput.fill(password);

      await page.getByRole("button", { name: buttonLabel }).click();

      await expect(
        page.getByText(successMessage, { exact: true }).first(),
      ).toBeVisible();
    });
  });
});
