"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

const SUPABASE_INVALID_CREDENTIALS = "invalid_credentials";
const SUPABASE_EMAIL_SUFFIX = "@alfredosrenovations.com";

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const db = await createClient();

  const response = await db.auth
    .signInWithPassword({
      email: username + SUPABASE_EMAIL_SUFFIX,
      password,
    })
    .catch((err) => {
      console.log("Error logging in:", err);

      return null;
    });

  if (!response) {
    return ERROR_CODES.UNKNOWN;
  }

  if (!response.error) {
    return ERROR_CODES.SUCCESS;
  }

  if (response.error.code === SUPABASE_INVALID_CREDENTIALS) {
    return ERROR_CODES.INVALID_CREDENTIALS;
  }

  return ERROR_CODES.UNKNOWN;
}
