import {
  USER_STATUS_MESSAGES,
  UserStatusMessage,
} from "@/features/db/user/user.constant";
import { User } from "@/features/db/user/user.model";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  status: UserStatusMessage;
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
      status: USER_STATUS_MESSAGES.INVALID_CREDENTIALS,
      message: t("message.invalidCredentials"),
    });
  }

  const result = await User.login(
    parsedBody.data.username,
    parsedBody.data.password,
  );

  if (result === USER_STATUS_MESSAGES.OK)
    return Response.json({
      success: true,
      status: USER_STATUS_MESSAGES.OK,
      message: t("message.success"),
    });

  if (result === USER_STATUS_MESSAGES.INVALID_CREDENTIALS)
    return Response.json({
      success: false,
      status: USER_STATUS_MESSAGES.INVALID_CREDENTIALS,
      message: t("message.invalidCredentials"),
    });

  return Response.json({
    success: false,
    status: USER_STATUS_MESSAGES.UNKNOWN_ERROR,
    message: t("message.unknown"),
  });
}
