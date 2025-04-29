import { ERROR_CODES } from "@/features/auth/logout/error_codes.constant";
import { logout } from "@/features/auth/logout/logout.action";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

export async function GET() {
  const t = await getTranslations("logout.api");

  const result = await logout();

  if (result === ERROR_CODES.SUCCESS)
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
