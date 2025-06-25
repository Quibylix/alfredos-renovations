import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { createBrowserClient } from "@/features/db/supabase/create-browser-client.util";
import convert from "heic-convert/browser";
import { randomId } from "@mantine/hooks";

export function useUploadMediaDropzone(
  addMedia: (type: "image" | "video", url: string) => void,
) {
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

    const mediaType = getMediaTypeFromMimeType(file.type);
    const originalExtension = getExtensionFromMimeType(file.type);

    if (mediaType === null || originalExtension === null) {
      return handleMimeTypeNotSupported();
    }

    const extension = originalExtension === "heif" ? "jpeg" : originalExtension;
    let mediaBuffer;
    try {
      mediaBuffer =
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

    const mediaName = `${randomId(`${mediaType}-`)}.${extension}`;

    const uploadResult = await db.storage
      .from("media")
      .upload(mediaName, mediaBuffer, {
        contentType: file.type,
      })
      .catch((error) => {
        console.log("Error uploading media:", error);
        return null;
      });

    if (!uploadResult || uploadResult.error) {
      if (uploadResult)
        console.error("Error uploading media:", uploadResult.error);

      return handleUnknownError();
    }

    const {
      data: { publicUrl: url },
    } = db.storage.from("media").getPublicUrl(mediaName);

    addMedia(mediaType, url);
    return handleSuccessResponse();

    function handleSuccessResponse() {
      setLoading(false);
      setError(null);
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
      });
    }

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

function getMediaTypeFromMimeType(mimeType: string): "image" | "video" | null {
  switch (mimeType) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
    case "image/webp":
    case "image/heif":
      return "image";
    case "video/mp4":
    case "video/quicktime":
      return "video";
    default:
      return null;
  }
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
    case "video/mp4":
      return "mp4";
    case "video/quicktime":
      return "mov";
    default:
      return null;
  }
}
