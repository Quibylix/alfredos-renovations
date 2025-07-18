import { ERROR_CODES } from "@/features/messages/send-message/error_codes.constant";
import { sendMessage } from "@/features/messages/send-message/send-message.action";
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
  const t = await getTranslations("sendMessage.api");

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

  const errorCode = await sendMessage(parsedBody.data);

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
