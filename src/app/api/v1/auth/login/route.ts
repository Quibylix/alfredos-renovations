import { ERROR_CODES } from "@/features/auth/login-form/error_codes.constant";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";

export type Response = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

export async function POST(request: NextRequest) {
  const t = await getTranslations("login.api");

  const body = await request.json();

  console.log(body);

  return Response.json({
    success: true,
    errorCode: ERROR_CODES.SUCCESS,
    message: t("message.success"),
  });
}
