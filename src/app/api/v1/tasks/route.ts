import { generateApiRouteResponse } from "@/features/shared/routes/api-routes.util";
import { ERROR_CODES } from "@/features/tasks/set-task/error_codes.constant";
import { setTask } from "@/features/tasks/set-task/set-task.action";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { setTaskApiResponseSchema } from "./schemas";
import { ProjectId } from "@/features/projects/models/project-id.model";
import { TaskTitle } from "@/features/tasks/models/task-title.model";
import { TaskDescription } from "@/features/tasks/models/task-description.model";
import { TaskDateRangeWithFutureEnd } from "@/features/tasks/models/task-date-range.model";
import { UserId } from "@/features/auth/models/user-id.model";
import { MediaType } from "@/features/media/models/media-type.model";
import { MediaUrl } from "@/features/media/models/media-url.model";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z
  .object({
    projectId: z.number(),
    title: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    employees: z.array(z.string()),
    media: z.array(
      z.object({
        type: z.string(),
        url: z.string(),
      }),
    ),
  })
  .transform((data) => ({
    projectId: new ProjectId(data.projectId),
    title: new TaskTitle(data.title),
    description: new TaskDescription(data.description),
    dateRange: new TaskDateRangeWithFutureEnd(data.startDate, data.endDate),
    employees: data.employees.map((employee) => new UserId(employee)),
    media: data.media.map((mediaItem) => ({
      type: new MediaType(mediaItem.type),
      url: new MediaUrl(mediaItem.url),
    })),
  }));

export const POST = generateApiRouteResponse<
  z.infer<typeof setTaskApiResponseSchema>
>(async (request) => {
  const t = await getTranslations("setTask.api");

  let parsedBody;
  try {
    const body = await request.json();
    parsedBody = bodySchema.parse(body);
  } catch {
    return {
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    };
  }

  const errorCode = await setTask(parsedBody);

  if (errorCode === ERROR_CODES.SUCCESS) {
    return {
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    };
  }

  return {
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  };
});
