import { Database } from "@/features/db/supabase/types";
import { expect, Page, test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { users } from "./users.constant";
import es from "@/features/i18n/messages/es.json";
import path from "path";
import { AppRoutes } from "@/features/shared/app-routes.util";
import { projects } from "./projects.constant";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

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

  await Promise.all(
    users.map(async (user) => {
      return await client.auth.admin.deleteUser(user.id);
    }),
  );

  await prisma.project.deleteMany();

  return;
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

  await Promise.all(
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

  return await prisma.project.createMany({
    data: Object.values(projects),
  });
}

setup("create new database", async ({}) => {
  await resetDatabase();
  await configureDatabase();
});

async function getLoginState(
  page: Page,
  user: { username: string; password: string },
) {
  const authFile = path.resolve(__dirname, ".auth", `${user.username}.json`);

  await page.goto(AppRoutes.getRoute("LOGIN"));

  const usernameLabel = es.login.form.username.label;
  const passwordLabel = es.login.form.password.label;
  const buttonText = es.login.form.submit;

  await page.getByRole("textbox", { name: usernameLabel }).fill(user.username);
  await page.getByRole("textbox", { name: passwordLabel }).fill(user.password);

  await page.getByRole("button", { name: buttonText }).click();

  await expect(page).toHaveURL((url) => {
    return url.pathname === AppRoutes.getRoute("HOME");
  });

  await page.context().storageState({ path: authFile });
  await page.context().clearCookies();
}

setup("get employees states", async ({ page }) => {
  for (const user of Object.values(users)) {
    await getLoginState(page, user);
  }
});
