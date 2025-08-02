import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  STATUS_MESSAGES,
  StatusMessage,
} from "@/features/shared/app-errors/status-messages.constant";
import { UnauthorizedError } from "@/features/shared/app-errors/unauthorized.error";
import { CreateProject } from "@/features/db/project/queries/create-project.query";

export type APIResponse = {
  success: boolean;
  status: StatusMessage;
  message: string;
};

const bodySchema = z.object({
  title: z.string().trim().nonempty(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("createProject.api");

  const body = await request.json();

  let parsedBody;
  try {
    parsedBody = bodySchema.parse(body);
  } catch {
    return Response.json({
      success: false,
      status: STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  try {
    await new CreateProject(parsedBody).execute();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({
        success: false,
        status: STATUS_MESSAGES.NOT_AUTHORIZED,
        message: t("message.notAuthorized"),
      });
    }

    return Response.json({
      success: false,
      status: STATUS_MESSAGES.UNKNOWN_ERROR,
      message: t("message.unknown"),
    });
  }

  return Response.json({
    success: true,
    status: STATUS_MESSAGES.OK,
    message: t("message.success"),
  });
}
