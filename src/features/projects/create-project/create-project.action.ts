"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";

export async function createProject({ title }: { title: string }) {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role !== "boss") {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const response = await db
    .from("project")
    .insert({
      title,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting project:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
