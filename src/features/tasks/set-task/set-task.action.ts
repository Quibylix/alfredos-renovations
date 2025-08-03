"use server";
import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { firebaseMessaging } from "@/lib/firebase-admin";
import { getTranslations } from "next-intl/server";
import { TaskTitle } from "../models/task-title.model";
import { TaskDescription } from "../models/task-description.model";
import { TaskDateRangeWithFutureEnd } from "../models/task-date-range.model";
import { ProjectId } from "@/features/projects/models/project-id.model";
import { UserId } from "@/features/auth/models/user-id.model";
import { MediaType } from "@/features/media/models/media-type.model";
import { MediaUrl } from "@/features/media/models/media-url.model";
import { TaskId } from "../models/task-id.model";
import { UnauthorizedError } from "@/features/shared/app-errors/unauthorized.error";
import { FcmToken } from "@/features/notifications/models/fcm-token.model";

export async function setTask({
  projectId,
  title,
  dateRange,
  description,
  employees,
  media,
}: {
  projectId: ProjectId;
  title: TaskTitle;
  description: TaskDescription;
  dateRange: TaskDateRangeWithFutureEnd;
  employees: UserId[];
  media: { type: MediaType; url: MediaUrl }[];
}) {
  const t = await getTranslations("setTask");

  const userId = new UserId((await User.getCurrentUserId()) ?? "");
  const userRole = await User.getRole(userId.toString());

  if (userRole !== "boss") {
    throw new UnauthorizedError();
  }

  const db = createAdminClient();

  const response = await db
    .from("task")
    .insert({
      title: title.toString(),
      description: description.toString(),
      start_date: dateRange.getStartDate().toISOString(),
      end_date: dateRange.getEndDate().toISOString(),
      project_id: projectId.toNumber(),
      boss_id: userId.toString(),
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting task:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  const taskId = new TaskId(response.data.id);

  const mediaInsertions = media.map((m) => ({
    task_id: taskId.toNumber(),
    type: m.type.toString(),
    url: m.url.toString(),
  }));

  const mediaResponse = await db.from("task_media").insert(mediaInsertions);

  if (mediaResponse.error) {
    console.error("Error inserting task media:", mediaResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  const employeeInsertions = employees.map((employeeId) => ({
    task_id: taskId.toNumber(),
    employee_id: employeeId.toString(),
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
      assignment.profile_fcm_token.map((token) =>
        new FcmToken(token.token).toString(),
      ),
    )
    .concat(
      bossesResponse.data.flatMap((boss) =>
        boss.profile_fcm_token.map((token) =>
          new FcmToken(token.token).toString(),
        ),
      ),
    );

  if (fcmTokens.length === 0) {
    return ERROR_CODES.SUCCESS;
  }

  try {
    await firebaseMessaging.sendEachForMulticast({
      tokens: fcmTokens,
      data: {
        title: t("notification.title"),
        body: t("notification.body", { title: title.toString() }),
      },
    });
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
