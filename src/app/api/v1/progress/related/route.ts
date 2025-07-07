import { ERROR_CODES } from "@/features/tasks/get-tasks/error_codes.constant";
import {
  getRelatedProgress,
  TaskData,
} from "@/features/tasks/get-tasks/get-related-tasks.action";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
  tasks: TaskData[];
};

export async function GET() {
  const t = await getTranslations("getRelatedProgress.api");

  const { errorCode, tasks } = await getRelatedProgress();

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return Response.json({
      errorCode,
      message: t("message.notAuthorized"),
      tasks: [],
    });
  }

  if (errorCode === ERROR_CODES.UNKNOWN) {
    return Response.json({
      errorCode,
      message: t("message.unknown"),
      tasks: [],
    });
  }

  return Response.json({
    errorCode,
    message: t("message.success"),
    tasks,
  });
}
