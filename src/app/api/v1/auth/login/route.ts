import { ERROR_CODES } from "@/features/auth/login/error_codes.constant";
import { login } from "@/features/auth/login/login.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  username: z.string().trim().nonempty(),
  password: z.string().nonempty(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("login.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_CREDENTIALS,
      message: t("message.invalidCredentials"),
    });
  }

  const result = await login(parsedBody.data);

  if (result === ERROR_CODES.SUCCESS)
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });

  if (result === ERROR_CODES.INVALID_CREDENTIALS)
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_CREDENTIALS,
      message: t("message.invalidCredentials"),
    });

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
