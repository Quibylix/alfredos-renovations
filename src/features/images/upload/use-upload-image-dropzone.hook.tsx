import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
// import { APIResponse as UploadImageAPIResponse } from "@/app/api/v1/images/upload/route";
// import { ERROR_CODES as UPLOAD_IMAGE_API_ERROR_CODES } from "./error_codes.constant";
// import { AppRoutes } from "@/features/shared/app-routes.util";
import { createBrowserClient } from "@/features/db/supabase/create-browser-client.util";
import convert from "heic-convert/browser";
import { randomId } from "@mantine/hooks";

export function useUploadImageDropzone(setImageURL: (url: string) => void) {
  const t = useTranslations("uploadImage");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropzoneOpenRef = useRef<() => void>(null);

  function captureFromCamera() {
    dropzoneOpenRef.current?.();
  }

  async function handleDrop(files: File[]) {
    setError(null);
    setLoading(true);

    const file = files[0];

    const db = await createBrowserClient();

    const originalExtension = getExtensionFromMimeType(file.type);

    if (originalExtension === null) {
      return handleMimeTypeNotSupported();
    }

    const extension = originalExtension === "heif" ? "jpeg" : originalExtension;
    let imageBuffer;
    try {
      imageBuffer =
        originalExtension === "heif"
          ? await convert({
              buffer: new Uint8Array(
                await file.arrayBuffer(),
              ) as unknown as ArrayBuffer,
              format: "JPEG",
              quality: 0.3,
            })
          : await file.arrayBuffer();
    } catch (error) {
      console.error("Error converting HEIF image:", error);
      return handleUnknownError();
    }

    const imageName = `${randomId("image-")}.${extension}`;

    const uploadResult = await db.storage
      .from("images")
      .upload(imageName, imageBuffer, {
        contentType: file.type,
      })
      .catch((error) => {
        console.log("Error uploading image:", error);
        return null;
      });

    if (!uploadResult || uploadResult.error) {
      if (uploadResult)
        console.error("Error uploading image:", uploadResult.error);

      return handleUnknownError();
    }

    const {
      data: { publicUrl: url },
    } = db.storage.from("images").getPublicUrl(imageName);

    setImageURL(url);
    return handleSuccessResponse();

    // const options = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     image: Array.from(new Uint8Array(await file.arrayBuffer())),
    //     mimeType: file.type,
    //   }),
    // };
    //
    // fetch(AppRoutes.getRoute("API_UPLOAD_IMAGE"), options)
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw new Error("Network response was not ok");
    //     }
    //
    //     return response.json();
    //   })
    //   .then((res: UploadImageAPIResponse) => handleApiResponse(res))
    //   .catch((error) => {
    //     console.error("Error:", error);
    //     handleUnknownError();
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });

    // function handleApiResponse(res: UploadImageAPIResponse) {
    //   if (res.success) {
    //     setImageURL(res.data.imageURL);
    //     return handleSuccessResponse();
    //   }
    //
    //   if (res.errorCode === UPLOAD_IMAGE_API_ERROR_CODES.INVALID_REQUEST) {
    //     return handleInvalidRequest();
    //   }
    //
    //   if (
    //     res.errorCode === UPLOAD_IMAGE_API_ERROR_CODES.MIME_TYPE_NOT_SUPPORTED
    //   ) {
    //     return handleMimeTypeNotSupported();
    //   }
    //
    //   handleUnknownError();
    // }
    //
    function handleSuccessResponse() {
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
      });
    }

    // function handleInvalidRequest() {
    //   setError(t("api.message.invalidRequest"));
    //   notifications.show({
    //     title: t("error"),
    //     message: t("api.message.invalidRequest"),
    //     color: "red",
    //   });
    // }

    function handleMimeTypeNotSupported() {
      setError(t("api.message.mimeTypeNotSupported"));
      notifications.show({
        title: t("error"),
        message: t("api.message.mimeTypeNotSupported"),
        color: "red",
      });
    }

    function handleUnknownError() {
      setError(t("api.message.unknown"));
      notifications.show({
        title: t("error"),
        message: t("api.message.unknown"),
        color: "red",
      });
    }
  }

  return {
    handleDrop,
    error,
    loading,
    captureFromCamera,
    dropzoneOpenRef,
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
