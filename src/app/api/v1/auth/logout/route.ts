import { USER_STATUS_MESSAGES } from "@/features/db/user/user.constant";
import { User } from "@/features/db/user/user.model";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  success: boolean;
  status: (typeof USER_STATUS_MESSAGES)[keyof typeof USER_STATUS_MESSAGES];
  message: string;
};

export async function GET() {
  const t = await getTranslations("logout.api");

  const result = await User.logout();

  if (result === USER_STATUS_MESSAGES.OK)
    return Response.json({
      success: true,
      status: USER_STATUS_MESSAGES.OK,
      message: t("message.success"),
    });

  return Response.json({
    success: false,
    status: USER_STATUS_MESSAGES.UNKNOWN_ERROR,
    message: t("message.unknown"),
  });
}
