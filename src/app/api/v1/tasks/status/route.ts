import {
  TASK_STATUS_MESSAGES,
  TaskStatusMessage,
} from "@/features/db/task/task.constant";
import { Task } from "@/features/db/task/task.model";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type UpdateTaskStatusAPIResponse = {
  success: boolean;
  status: TaskStatusMessage;
  message: string;
};

const bodySchema = z.object({
  taskId: z.number().int().positive(),
  completed: z.boolean(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("updateTaskStatus.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    } as UpdateTaskStatusAPIResponse);
  }

  const status = await Task.updateTaskStatus(
    parsedBody.data.taskId,
    parsedBody.data.completed,
  );

  if (status === TASK_STATUS_MESSAGES.OK) {
    return Response.json({
      success: true,
      status: TASK_STATUS_MESSAGES.OK,
      message: t("message.success"),
    } as UpdateTaskStatusAPIResponse);
  }

  if (status === TASK_STATUS_MESSAGES.NOT_AUTHORIZED) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.NOT_AUTHORIZED,
      message: t("message.notAuthorized"),
    } as UpdateTaskStatusAPIResponse);
  }

  return Response.json({
    success: false,
    status: TASK_STATUS_MESSAGES.UNKNOWN,
    message: t("message.unknown"),
  } as UpdateTaskStatusAPIResponse);
}
