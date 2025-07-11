import {
  TASK_STATUS_MESSAGES,
  TaskStatusMessage,
} from "@/features/db/task/task.constant";
import { Task } from "@/features/db/task/task.model";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type EditTaskAPIResponse = {
  success: boolean;
  status: TaskStatusMessage;
  message: string;
};

const bodySchema = z.object({
  taskId: z.number().int().positive(),
  title: z.string().trim().nonempty().optional(),
  description: z.string().trim().nonempty().optional(),
  completed: z.boolean().optional(),
  startDate: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .optional(),
  endDate: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .optional(),
  projectId: z.number().int().positive().optional(),
  newEmployees: z.array(z.string().trim().nonempty()).optional(),
  removedEmployees: z.array(z.string().trim().nonempty()).optional(),
  newMedia: z
    .array(
      z.object({
        type: z.enum(["image", "video"]),
        url: z.string().url(),
      }),
    )
    .optional(),
  removedMedia: z.array(z.number().int().positive()).optional(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("editTask.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);
  console.log(parsedBody.error);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const startDate = parsedBody.data.startDate;
  const endDate = parsedBody.data.endDate;

  if ((startDate && !endDate) || (endDate && !startDate)) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  if (startDate && endDate && (startDate > endDate || endDate < new Date())) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const taskProps = { ...parsedBody.data } as Partial<
    z.infer<typeof bodySchema>
  >;
  delete taskProps.taskId;

  const status = await Task.editTask(parsedBody.data.taskId, taskProps);

  if (status === TASK_STATUS_MESSAGES.OK) {
    return Response.json({
      success: true,
      status: TASK_STATUS_MESSAGES.OK,
      message: t("message.success"),
    });
  }

  if (status === TASK_STATUS_MESSAGES.INVALID_REQUEST) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  if (status === TASK_STATUS_MESSAGES.NOT_AUTHORIZED) {
    return Response.json({
      success: false,
      status: TASK_STATUS_MESSAGES.NOT_AUTHORIZED,
      message: t("message.unknown"),
    });
  }

  return Response.json({
    success: false,
    status: TASK_STATUS_MESSAGES.UNKNOWN,
    message: t("message.unknown"),
  });
}
