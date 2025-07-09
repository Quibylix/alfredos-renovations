"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { TaskData } from "@/features/db/task/task.types";
import { User } from "@/features/db/user/user.model";
import { USER_ROLES } from "@/features/db/user/user.constant";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { taskEmployeeValidator } from "@/features/messages/send-message/task-employee-validator.action";

export type MessageData = {
  id: number;
  content: string;
  sentDate: string;
  profile: {
    id: string;
    fullName: string;
  };
  media: {
    id: number;
    type: "image" | "video";
    url: string;
  }[];
};

export async function getTaskMessages(taskId: number): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  task: TaskData | null;
  messages: MessageData[];
}> {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === USER_ROLES.ANON) {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      task: null,
      messages: [],
    };
  }

  if (!(await taskEmployeeValidator(taskId))) {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      task: null,
      messages: [],
    };
  }

  const { data: taskData, error: taskError } = await db
    .from("task")
    .select(
      `id, title, description, startDate: start_date, endDate: end_date,
        completed, createdAt: created_at,
        employees: employee(id, ...profile(fullName: full_name)),
        media: task_media (id, type, url),
        boss(id, ...profile(fullName: full_name)),
        project(id, title)`,
    )
    .eq("id", taskId)
    .single();

  if (!taskData) {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      task: null,
      messages: [],
    };
  }

  if (taskError) {
    console.error("Error fetching projects:", taskError);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      task: null,
      messages: [],
    };
  }

  const { data: messagesData, error: messagesError } = await db
    .from("message")
    .select(
      `id, content, sentDate: sent_date,
      profile(id, fullName: full_name),
      media: message_media(id, type, url)`,
    )
    .eq("task_id", taskId);

  if (messagesError) {
    console.error("Error fetching task data:", messagesError);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      task: null,
      messages: [],
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    task: taskData as TaskData,
    messages: messagesData as MessageData[],
  };
}
