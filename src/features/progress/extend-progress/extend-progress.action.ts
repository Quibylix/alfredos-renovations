"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { projectProgressEmployeeValidator } from "./project-progress-employee-validator.action";

export async function extendProgress({
  taskId,
  content,
  media,
}: {
  taskId: number;
  content: string | null;
  media: { type: "image" | "video"; url: string }[];
}) {
  const userId = await User.getCurrentUserId();
  const db = createAdminClient();

  if (!(await projectProgressEmployeeValidator(taskId))) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const response = await db
    .from("message")
    .insert({
      content: content ?? "",
      task_id: taskId,
      profile_id: userId!,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting message:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  const messageId = response.data.id;

  const mediaInsertions = media.map((m) => ({
    message_id: messageId,
    type: m.type,
    url: m.url,
  }));

  const mediaResponse = await db.from("message_media").insert(mediaInsertions);

  if (mediaResponse.error) {
    console.error("Error inserting message media:", mediaResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
