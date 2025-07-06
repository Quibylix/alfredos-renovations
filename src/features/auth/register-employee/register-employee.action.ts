"use server";

import { User } from "@/features/db/user/user.model";
import { ERROR_CODES } from "./error_codes.constant";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";

const SUPABASE_USERNAME_TAKEN = "email_exists";
const SUPABASE_EMAIL_SUFFIX = "@alfredosrenovations.com";

export async function registerEmployee({
  username,
  fullName,
  password,
}: {
  username: string;
  fullName: string;
  password: string;
}) {
  const userRole = await User.getRole();

  if (userRole !== "boss") {
    return ERROR_CODES.INVALID_CREDENTIALS;
  }

  const db = createAdminClient();

  const response = await db.auth.admin
    .createUser({
      email: username + SUPABASE_EMAIL_SUFFIX,
      password,
      email_confirm: true,
      user_metadata: {
        role: "employee",
        full_name: fullName,
      },
    })
    .catch((err) => {
      console.error("Error signing up:", err);

      return null;
    });

  if (!response) {
    return ERROR_CODES.UNKNOWN;
  }

  if (!response.error) {
    return ERROR_CODES.SUCCESS;
  }

  if (response.error.code === SUPABASE_USERNAME_TAKEN) {
    return ERROR_CODES.USERNAME_TAKEN;
  }

  return ERROR_CODES.UNKNOWN;
}
