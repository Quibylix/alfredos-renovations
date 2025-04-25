import { ERROR_CODES } from "@/features/projects/get-related-projects/error_codes.constant";
import { getRelatedProjects } from "@/features/projects/get-related-projects/get-related-projects.action";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
  projects: { id: number; title: string }[];
};

export async function GET() {
  const t = await getTranslations("getRelatedProjects.api");

  const { errorCode, projects } = await getRelatedProjects();

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return Response.json({
      errorCode,
      message: t("message.notAuthorized"),
      projects: [],
    });
  }

  if (errorCode === ERROR_CODES.UNKNOWN) {
    return Response.json({
      errorCode,
      message: t("message.unknown"),
      projects: [],
    });
  }

  return Response.json({
    errorCode,
    message: t("message.success"),
    projects,
  });
}
