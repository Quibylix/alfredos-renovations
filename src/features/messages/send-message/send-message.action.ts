"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { taskEmployeeValidator } from "./task-employee-validator.action";
import { firebaseMessaging } from "@/lib/firebase-admin";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/features/db/prisma/db";

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

  const taskIsCompleted = await db
    .from("task")
    .select("completed")
    .eq("id", taskId)
    .single();

  if (!taskIsCompleted.data || taskIsCompleted.error) {
    console.error(
      "Error fetching task completion status:",
      taskIsCompleted.error,
    );
    return ERROR_CODES.UNKNOWN;
  }

  if (taskIsCompleted.data.completed) {
    return ERROR_CODES.INVALID_REQUEST;
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

  try {
    await firebaseMessaging.sendEachForMulticast({
      tokens: await getFcmTokens(taskId, userId),
      data: {
        title: t("title"),
        body: t("body", {
          sender: userName.data.full_name,
          taskTitle: response.data.task.title,
        }),
      },
    });
  } catch (error) {
    console.error("Error sending FCM message:", error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}

async function getFcmTokens(taskId: number, userId: string | null) {
  const bossFCMTokens = await prisma.boss.findMany({
    where: {
      NOT: {
        id: userId!,
      },
    },
    select: {
      profile: {
        select: {
          profile_fcm_token: {
            select: {
              token: true,
            },
          },
        },
      },
    },
  });

  const employeeFCMTokens = await prisma.task_assignment.findMany({
    where: {
      task_id: taskId,
      employee_id: {
        not: userId!,
      },
    },
    select: {
      employee: {
        select: {
          profile: {
            select: {
              profile_fcm_token: {
                select: {
                  token: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return [
    ...bossFCMTokens.flatMap((boss) =>
      boss.profile.profile_fcm_token.map((token) => token.token),
    ),
    ...employeeFCMTokens.flatMap((assignment) =>
      assignment.employee.profile.profile_fcm_token.map((token) => token.token),
    ),
  ];
}
