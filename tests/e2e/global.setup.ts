import { Database } from "@/features/db/supabase/types";
import { expect, Page, test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { users } from "./seed/data/users.constant";
import es from "@/features/i18n/messages/es.json";
import path from "path";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { prisma } from "./seed/prisma-client";
import { seedData } from "./seed/seed";

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

async function getLoginState(
  page: Page,
  user: { key: string; username: string; password: string },
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

setup("create new database", async ({ page }) => {
  await resetDatabase();
  await seedData();
  for (const user of Object.entries(users)) {
    await getLoginState(page, { ...user[1], key: user[0] });
  }
});
