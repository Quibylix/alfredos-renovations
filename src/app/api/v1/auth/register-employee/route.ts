import { ERROR_CODES } from "@/features/auth/register-employee/error_codes.constant";
import { registerEmployee } from "@/features/auth/register-employee/register-employee.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  username: z.string().trim().min(3).max(50),
  fullName: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(50),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("registerEmployee.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_CREDENTIALS,
      message: t("message.invalidCredentials"),
    });
  }

  const result = await registerEmployee(parsedBody.data);

  if (result === ERROR_CODES.SUCCESS)
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });

  if (result === ERROR_CODES.USERNAME_TAKEN)
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.USERNAME_TAKEN,
      message: t("message.usernameTaken"),
    });

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
