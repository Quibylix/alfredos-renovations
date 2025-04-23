import { ERROR_CODES } from "@/features/images/upload/error_codes.constant";
import { uploadImage } from "@/features/images/upload/upload-image.action";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export type APIResponse = {
  success: boolean;
  data: {
    imageURL: string;
  };
  errorCode: string;
  message: string;
};

const bodySchema = z.object({
  image: z.array(z.number().max(255).min(0)),
  mimeType: z.string().startsWith("image/"),
});

export async function POST(request: NextRequest) {
  const t = await getTranslations("uploadImage.api");

  const body = await request.json();

  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.INVALID_REQUEST,
      message: t("message.invalidRequest"),
    });
  }

  const { errorCode, url } = await uploadImage(
    new Uint8Array(parsedBody.data.image).buffer,
    parsedBody.data.mimeType as `image/${string}`,
  );

  if (errorCode === ERROR_CODES.SUCCESS) {
    return Response.json({
      success: true,
      data: {
        image_url: url,
      },
      errorCode: ERROR_CODES.SUCCESS,
      message: t("message.success"),
    });
  }

  if (errorCode === ERROR_CODES.MIME_TYPE_NOT_SUPPORTED) {
    return Response.json({
      success: false,
      errorCode: ERROR_CODES.MIME_TYPE_NOT_SUPPORTED,
      message: t("message.mimeTypeNotSupported"),
    });
  }

  return Response.json({
    success: false,
    errorCode: ERROR_CODES.UNKNOWN,
    message: t("message.unknown"),
  });
}
