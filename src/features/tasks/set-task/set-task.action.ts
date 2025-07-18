"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { firebaseMessaging } from "@/lib/firebase-admin";
import { getTranslations } from "next-intl/server";

export async function setTask({
  projectId,
  title,
  description,
  startDate,
  endDate,
  employees,
  media,
}: {
  projectId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  employees: string[];
  media: { type: "image" | "video"; url: string }[];
}) {
  const t = await getTranslations("setTask");

  const userId = await User.getCurrentUserId();
  const userRole = await User.getRole(userId);

  if (userRole !== "boss") {
    return ERROR_CODES.INVALID_REQUEST;
  }

  const db = createAdminClient();

  const response = await db
    .from("task")
    .insert({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      project_id: projectId,
      boss_id: userId!,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting task:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  const taskId = response.data.id;

  const mediaInsertions = media.map((m) => ({
    task_id: taskId,
    type: m.type,
    url: m.url,
  }));

  const mediaResponse = await db.from("task_media").insert(mediaInsertions);

  if (mediaResponse.error) {
    console.error("Error inserting task media:", mediaResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  const employeeInsertions = employees.map((employeeId) => ({
    task_id: taskId,
    employee_id: employeeId,
  }));

  const employeeResponse = await db
    .from("task_assignment")
    .insert(employeeInsertions)
    .select("...employee(...profile(profile_fcm_token(token)))");

  if (employeeResponse.error) {
    console.error("Error assigning employees to task:", employeeResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  const bossesResponse = await db
    .from("boss")
    .select("...profile(profile_fcm_token(token))");

  if (bossesResponse.error) {
    console.error("Error fetching boss profile:", bossesResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  const fcmTokens = employeeResponse.data
    .flatMap((assignment) =>
      assignment.profile_fcm_token.map((token) => token.token),
    )
    .concat(
      bossesResponse.data.flatMap((boss) =>
        boss.profile_fcm_token.map((token) => token.token),
      ),
    );

  try {
    await firebaseMessaging.subscribeToTopic(fcmTokens, `task_${taskId}`);
    await firebaseMessaging.send({
      topic: `task_${taskId}`,
      data: {
        title: t("notification.title"),
        body: t("notification.body", { title }),
      },
    });
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
