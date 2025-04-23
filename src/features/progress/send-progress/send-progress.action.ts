"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export async function sendProgress({
  projectId,
  title,
  description,
  imageUrl,
}: {
  projectId: number;
  title: string;
  description: string;
  imageUrl: string | null;
}) {
  const db = await createClient();

  const userResult = await db.auth.getUser();

  if (!userResult.data.user) {
    return ERROR_CODES.INVALID_REQUEST;
  }

  const response = await db
    .from("progress")
    .insert({
      title,
      description,
      image_url: imageUrl,
      employee_id: userResult.data.user.id,
      project_id: projectId,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
