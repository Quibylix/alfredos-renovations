import { ERROR_CODES } from "@/features/tasks/set-task/error_codes.constant";
import { setTask } from "@/features/tasks/set-task/set-task.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().trim().nonempty(),
  description: z.string().trim().nonempty(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  employees: z.array(z.string().trim().nonempty()).nonempty(),
  media: z.array(
    z.object({
      type: z.enum(["image", "video"]),
      url: z.string().url(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("setTask.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const startDate = new Date(parsedBody.data.startDate);
  const endDate = new Date(parsedBody.data.endDate);
  if (startDate > endDate || endDate < new Date()) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const errorCode = await setTask(parsedBody.data);

  if (errorCode === ERROR_CODES.SUCCESS) {
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });
  }

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
