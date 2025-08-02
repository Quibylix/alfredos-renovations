import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { STATUS_MESSAGES } from "@/features/shared/app-errors/status-messages.constant";
import { UnauthorizedError } from "@/features/shared/app-errors/unauthorized.error";
import { CreateProject } from "@/features/db/project/queries/create-project.query";
import { generateApiRouteResponse } from "@/features/shared/routes/api-routes.util";
import {
  createProjectApiResponseSchema,
  createProjectApiBodySchema,
} from "./schemas";

export const POST = generateApiRouteResponse<
  z.infer<typeof createProjectApiResponseSchema>
>(async (request) => {
  const t = await getTranslations("createProject.api");

  try {
    const body = await request.json();
    const parsedBody = createProjectApiBodySchema.parse(body);
    await new CreateProject(parsedBody).execute();
  } catch (error) {
    return handleError(error, t);
  }

  return {
    success: true,
    status: STATUS_MESSAGES.OK,
    message: t("message.success"),
  };
});

function handleError(
  error: unknown,
  t: Awaited<ReturnType<typeof getTranslations<"createProject.api">>>,
) {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      status: STATUS_MESSAGES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      success: false,
      status: STATUS_MESSAGES.NOT_AUTHORIZED,
      message: t("message.notAuthorized"),
    };
  }

  return {
    success: false,
    status: STATUS_MESSAGES.UNKNOWN_ERROR,
    message: t("message.unknown"),
  };
}
