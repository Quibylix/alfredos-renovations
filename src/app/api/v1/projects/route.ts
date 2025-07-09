import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  PROJECT_STATUS_MESSAGES,
  ProjectStatusMessage,
} from "@/features/db/project/project.constant";
import { Project } from "@/features/db/project/project.model";

export type APIResponse = {
  success: boolean;
  status: ProjectStatusMessage;
  message: string;
};

const bodySchema = z.object({
  title: z.string().trim().nonempty(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("createProject.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      status: PROJECT_STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const status = await Project.createProject(parsedBody.data);

  if (status === PROJECT_STATUS_MESSAGES.OK) {
    return Response.json({
      success: true,
      status: PROJECT_STATUS_MESSAGES.OK,
      message: t("message.success"),
    });
  }

  if (status === PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED) {
    return Response.json({
      success: false,
      status: PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED,
      message: t("message.notAuthorized"),
    });
  }

  return Response.json({
    success: false,
    status: PROJECT_STATUS_MESSAGES.UNKNOWN,
    message: t("message.unknown"),
  });
}
