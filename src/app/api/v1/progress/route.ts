import { ERROR_CODES } from "@/features/progress/send-progress/error_codes.constant";
import { sendProgress } from "@/features/progress/send-progress/send-progress.action";
import { checkEmployeeIsInProject } from "@/features/projects/check-employee-is-in-project.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  message: string;
};

const bodySchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().trim().nonempty(),
  description: z.string().trim().nonempty(),
  imageUrl: z.string().url().nullable(),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("sendProgress.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const employeeIsInProject = await checkEmployeeIsInProject(
    parsedBody.data.projectId,
  );
  if (!employeeIsInProject) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const errorCode = await sendProgress(parsedBody.data);

  if (errorCode === ERROR_CODES.SUCCESS) {
    return Response.json({
      success: true,
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });
  }

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
