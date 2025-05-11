import { expect, test } from "@playwright/test";
import es from "@/features/i18n/messages/es.json";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
  });

  test("should display the login form", async ({ page }) => {
    const usernameLabel = es.login.form.username.label;
    const passwordLabel = es.login.form.password.label;

    await expect(
      page.getByRole("textbox", { name: usernameLabel }),
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: passwordLabel }),
    ).toBeVisible();
  });

  test("should display an error if username is empty", async ({ page }) => {
    const usernameLabel = es.login.form.username.label;
    const buttonText = es.login.form.submit;

    const usernameInput = page.getByRole("textbox", { name: usernameLabel });
    await usernameInput.fill("");
    await page.getByRole("button", { name: buttonText }).click();

    expect(
      await usernameInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity(),
      ),
    ).toBe(false);
  });

  test("should display an error if password is empty", async ({ page }) => {
    const passwordLabel = es.login.form.password.label;
    const buttonText = es.login.form.submit;

    const passwordInput = page.getByRole("textbox", { name: passwordLabel });
    await passwordInput.fill("");
    await page.getByRole("button", { name: buttonText }).click();

    expect(
      await passwordInput.evaluate((el: HTMLInputElement) =>
        el.checkValidity(),
      ),
    ).toBe(false);
  });

  test("should display an error if entering a valid password and a username of spaces only", async ({
    page,
  }) => {
    const usernameLabel = es.login.form.username.label;
    const passwordLabel = es.login.form.password.label;
    const buttonText = es.login.form.submit;

    const errorMessage = es.login.form.username.isRequired;

    await page.getByRole("textbox", { name: usernameLabel }).fill("   ");
    await page.getByRole("textbox", { name: passwordLabel }).fill(" ");

    await page.getByRole("button", { name: buttonText }).click();

    await expect(page.getByText(errorMessage)).toBeVisible();
  });

  test("should display an error if entering invalid credentials", async ({ page }) => {
    const invalidUsername = "invalidUser";
    const invalidPassword = "invalidPassword";

    const usernameLabel = es.login.form.username.label;
    const passwordLabel = es.login.form.password.label;
    const buttonText = es.login.form.submit;

    const errorMessage = es.login.api.message.invalidCredentials;

    await page
      .getByRole("textbox", { name: usernameLabel })
      .fill(invalidUsername);

    await page
      .getByRole("textbox", { name: passwordLabel })
      .fill(invalidPassword);

    await page.getByRole("button", { name: buttonText }).click();

    await expect(
      page.getByText(errorMessage).first(),
    ).toBeVisible();
  })

  test("should login successfully if valid credentials are provided", async ({
    page,
  }) => {
    const validUsername = "boss";
    const validPassword = "Password1234";

    const usernameLabel = es.login.form.username.label;
    const passwordLabel = es.login.form.password.label;
    const buttonText = es.login.form.submit;

    const successMessage = es.login.api.message.success;

    await page
      .getByRole("textbox", { name: usernameLabel })
      .fill(validUsername);
    await page
      .getByRole("textbox", { name: passwordLabel })
      .fill(validPassword);

    await page.getByRole("button", { name: buttonText }).click();

    await expect(page.getByText(successMessage).first()).toBeVisible();
    await expect(page).toHaveURL((url) => {
      return url.pathname === "/";
    });
  });
});
