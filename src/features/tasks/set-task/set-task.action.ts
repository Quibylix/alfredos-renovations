"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";

export async function sendProgress({
  projectId,
  title,
  description,
  startDate,
  duration,
  employees,
  media,
}: {
  projectId: number;
  title: string;
  description: string;
  startDate: string;
  duration: number;
  employees: string[];
  media: { type: "image" | "video"; url: string }[];
}) {
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
      duration,
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
    console.error("Error inserting progress media:", mediaResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  const employeeInsertions = employees.map((employeeId) => ({
    task_id: taskId,
    employee_id: employeeId,
  }));

  const employeeResponse = await db
    .from("task_assignment")
    .insert(employeeInsertions);

  if (employeeResponse.error) {
    console.error("Error assigning employees to task:", employeeResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
