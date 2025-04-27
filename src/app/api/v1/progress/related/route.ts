import { ERROR_CODES } from "@/features/progress/get-progress/error_codes.constant";
import {
  getRelatedProgress,
  ProgressData,
} from "@/features/progress/get-progress/get-related-progress.action";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
  progress: ProgressData[];
};

export async function GET() {
  const t = await getTranslations("getRelatedProgress.api");

  const { errorCode, progress } = await getRelatedProgress();

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return Response.json({
      errorCode,
      message: t("message.notAuthorized"),
      progress: [],
    });
  }

  if (errorCode === ERROR_CODES.UNKNOWN) {
    return Response.json({
      errorCode,
      message: t("message.unknown"),
      progress: [],
    });
  }

  return Response.json({
    errorCode,
    message: t("message.success"),
    progress,
  });
}
