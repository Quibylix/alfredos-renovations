import { Database } from "@/features/db/supabase/types";
import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

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
