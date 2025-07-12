import { users } from "./data/users.constant";
import { createClient } from "@supabase/supabase-js";

export function registerUsers(usersId: Record<keyof typeof users, string>) {
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

  return Promise.all(
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

      usersId[user] = response.data.user.id;
    }),
  );
}
