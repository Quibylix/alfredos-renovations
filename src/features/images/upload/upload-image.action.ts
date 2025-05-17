import { createClient } from "@/features/db/supabase/create-server-client.util";
import { randomUUID } from "crypto";
import { ERROR_CODES } from "./error_codes.constant";
import convert from "heic-convert";

export async function uploadImage(
  image: ArrayBuffer,
  mimeType: `image/${string}`,
) {
  const db = await createClient();

  const originalExtension = getExtensionFromMimeType(mimeType);

  if (originalExtension === null) {
    return {
      errorCode: ERROR_CODES.MIME_TYPE_NOT_SUPPORTED,
      url: null,
    };
  }

  const extension = originalExtension === "heif" ? "jpeg" : originalExtension;
  let imageBuffer;
  try {
    imageBuffer =
      originalExtension === "heif"
        ? await convert({
            buffer: new Uint8Array(image) as unknown as ArrayBuffer,
            format: "JPEG",
            quality: 0.3,
          })
        : image;
  } catch (error) {
    console.error("Error converting HEIF image:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      url: null,
    };
  }

  const imageName = `image-${randomUUID()}.${extension}`;

  const uploadResult = await db.storage
    .from("images")
    .upload(imageName, imageBuffer, {
      contentType: mimeType,
    })
    .catch((error) => {
      console.log("Error uploading image:", error);
      return null;
    });

  if (!uploadResult || uploadResult.error) {
    if (uploadResult)
      console.error("Error uploading image:", uploadResult.error);

    return {
      errorCode: ERROR_CODES.UNKNOWN,
      url: null,
    };
  }

  const {
    data: { publicUrl: url },
  } = db.storage.from("images").getPublicUrl(imageName);

  return {
    errorCode: ERROR_CODES.SUCCESS,
    url,
  };
}

function getExtensionFromMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/heif":
      return "heif";
    default:
      return null;
  }
}
