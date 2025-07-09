import {
  TASK_STATUS_MESSAGES,
  TaskStatusMessage,
} from "@/features/db/task/task.constant";
import { Task } from "@/features/db/task/task.model";
import { TaskData } from "@/features/db/task/task.types";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  status: TaskStatusMessage;
  message: string;
  tasks: TaskData[];
};

export async function GET() {
  const t = await getTranslations("getRelatedTasks.api");

  const { status, tasks } = await Task.getRelatedTasks().execute();

  if (status === TASK_STATUS_MESSAGES.NOT_AUTHORIZED) {
    return Response.json({
      errorCode: status,
      message: t("message.notAuthorized"),
      tasks: [],
    });
  }

  if (status === TASK_STATUS_MESSAGES.UNKNOWN) {
    return Response.json({
      errorCode: status,
      message: t("message.unknown"),
      tasks: [],
    });
  }

  return Response.json({
    errorCode: status,
    message: t("message.success"),
    tasks,
  });
}
