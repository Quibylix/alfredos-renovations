import { ERROR_CODES } from "@/features/projects/create-project/error_codes.constant";
import { createProject } from "@/features/projects/create-project/create-project.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  title: z.string().trim().nonempty(),
  employees: z.array(z.string().trim().nonempty()),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("createProject.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const errorCode = await createProject(parsedBody.data);

  if (errorCode === ERROR_CODES.SUCCESS) {
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });
  }

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      message: t("message.notAuthorized"),
    });
  }

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
