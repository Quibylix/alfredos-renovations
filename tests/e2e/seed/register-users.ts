import { users } from "./data/users.constant";
import { createClient } from "@supabase/supabase-js";
import { promises } from "fs";
import path from "path";

const { writeFile, mkdir } = promises;

export type StoredUserData = Record<
  keyof typeof users,
  {
    id: string;
    username: string;
    password: string;
    fullName: string;
    role: string;
  }
>;

export async function registerUsers() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const storedUserData = {} as StoredUserData;

  await Promise.all(
    (Object.keys(users) as (keyof typeof users)[]).map(async (user) => {
      const userData = users[user];

      const response = await supabaseClient.auth.admin.createUser({
        email: userData.username + "@alfredosrenovations.com",
        email_confirm: true,
        password: userData.password,
        user_metadata: {
          full_name: userData.fullName,
          role: userData.role,
        },
      });

      if (response.error) {
        console.error(`Error creating user ${user}:`, response.error);
        return;
      }

      storedUserData[user] = {
        id: response.data.user.id,
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
        role: userData.role,
      };
    }),
  );

  await mkdir(path.resolve(__dirname, ".data"), { recursive: true });
  await writeFile(
    path.resolve(__dirname, ".data", "users.json"),
    JSON.stringify(storedUserData, null, 2),
  );
}
