import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { Project } from "@/features/db/project/project.model";
import { getTranslations } from "next-intl/server";

export type APIResponse = {
  errorCode: (typeof PROJECT_STATUS_MESSAGES)[keyof typeof PROJECT_STATUS_MESSAGES];
  message: string;
  projects: { id: number; title: string }[];
};

export async function GET() {
  const t = await getTranslations("getRelatedProjects.api");

  const { status, projects } = await Project.getRelatedProjects();

  if (status === PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED) {
    return Response.json({
      status,
      message: t("message.notAuthorized"),
      projects: [],
    });
  }

  if (status === PROJECT_STATUS_MESSAGES.UNKNOWN) {
    return Response.json({
      status,
      message: t("message.unknown"),
      projects: [],
    });
  }

  return Response.json({
    status,
    message: t("message.success"),
    projects,
  });
}
