import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";

export const ERROR_CODES = {
  SUCCESS: 0,
  INVALID_CREDENTIALS: 1,
  UNKNOWN: 2,
} as const;

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
