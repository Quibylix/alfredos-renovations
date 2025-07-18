"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { taskEmployeeValidator } from "./task-employee-validator.action";
import { firebaseMessaging } from "@/lib/firebase-admin";
import { getTranslations } from "next-intl/server";

export async function sendMessage({
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

  if (!(await taskEmployeeValidator(taskId))) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const userName = await db
    .from("profile")
    .select("full_name")
    .eq("id", userId!)
    .single();

  if (!userName.data || userName.error) {
    console.error("Error fetching user name:", userName.error);
    return ERROR_CODES.UNKNOWN;
  }

  const response = await db
    .from("message")
    .insert({
      content: content ?? "",
      task_id: taskId,
      profile_id: userId!,
    })
    .select("id, task(title)")
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

  const t = await getTranslations("sendMessage.notification");

  await firebaseMessaging.send({
    topic: `task_${taskId}`,
    data: {
      title: t("title"),
      body: t("body", {
        sender: userName.data.full_name,
        taskTitle: response.data.task.title,
      }),
    },
  });

  return ERROR_CODES.SUCCESS;
}
