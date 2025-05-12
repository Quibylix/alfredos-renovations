import { Database } from "@/features/db/supabase/types";
import { expect, Page, test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import es from "@/features/i18n/messages/es.json";
import path from "path";

export const users = {
  boss: {
    username: "boss",
    password: "Password1234",
    fullName: "Boss",
    role: "boss",
  },
  employee1: {
    username: "employee1",
    password: "Password1234",
    fullName: "Employee 1",
    role: "employee",
  },
  employee2: {
    username: "employee2",
    password: "Password1234",
    fullName: "Employee 2",
    role: "employee",
  },
};

async function resetDatabase() {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const {
    data: { users },
    error,
  } = await client.auth.admin.listUsers();

  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  return Promise.all(
    users.map(async (user) => {
      return await client.auth.admin.deleteUser(user.id);
    }),
  );
}

async function configureDatabase() {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return Promise.all(
    Object.values(users).map(async (user) => {
      const { error } = await client.auth.admin.createUser({
        email: user.username + "@alfredosrenovations.com",
        password: user.password,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
        },
        email_confirm: true,
      });

      if (error) {
        console.error("Error creating user:", error);
      }
    }),
  );
}

setup("create new database", async ({}) => {
  await resetDatabase();
  await configureDatabase();
});

async function getLoginState(
  page: Page,
  authFile: string,
  user: { username: string; password: string },
) {
  const loginUrl = "/auth/login";

  await page.goto(loginUrl);

  const usernameLabel = es.login.form.username.label;
  const passwordLabel = es.login.form.password.label;
  const buttonText = es.login.form.submit;

  await page.getByRole("textbox", { name: usernameLabel }).fill(user.username);
  await page.getByRole("textbox", { name: passwordLabel }).fill(user.password);

  await page.getByRole("button", { name: buttonText }).click();

  await expect(page).toHaveURL((url) => {
    return url.pathname === "/";
  });

  await page.context().storageState({ path: authFile });
}

setup("authenticate as boss", async ({ page }) => {
  const authFile = path.join(__dirname, ".auth/boss.json");
  await getLoginState(page, authFile, users.boss);
});

setup("authenticate as employee1", async ({ page }) => {
  const authFile = path.join(__dirname, ".auth/employee1.json");
  await getLoginState(page, authFile, users.employee1);
});
