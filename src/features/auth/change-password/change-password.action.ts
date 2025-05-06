"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export async function changePassword({ password }: { password: string }) {
  const db = await createClient();

  const response = await db.auth.updateUser({ password }).catch((err) => {
    console.log("Error updating password:", err);

    return null;
  });

  if (!response) {
    return ERROR_CODES.UNKNOWN;
  }

  if (!response.data.user) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  if (response.error) {
    return ERROR_CODES.UNKNOWN;
  }

  await db.auth.signOut({ scope: "global" }).catch((err) => {
    console.log("Error signing out:", err);
  });

  return ERROR_CODES.SUCCESS;
}
