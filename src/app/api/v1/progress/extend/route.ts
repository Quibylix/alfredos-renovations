import { ERROR_CODES } from "@/features/progress/extend-progress/error_codes.constant";
import { extendProgress } from "@/features/progress/extend-progress/extend-progress.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  taskId: z.number().int().positive(),
  content: z.string().trim(),
  media: z.array(
    z.object({
      type: z.enum(["image", "video"]),
      url: z.string().url(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("extendProgress.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  if (!parsedBody.data.content && parsedBody.data.media.length === 0) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.NO_DATA,
      message: t("message.noData"),
    });
  }

  const errorCode = await extendProgress(parsedBody.data);

  if (errorCode === ERROR_CODES.SUCCESS) {
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });
  }

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      message: t("message.notAuthorized"),
    });
  }

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
