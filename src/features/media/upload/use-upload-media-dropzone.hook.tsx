import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { createBrowserClient } from "@/features/db/supabase/create-browser-client.util";
import convert from "heic-convert/browser";
import { randomId } from "@mantine/hooks";
import Compressor from "compressorjs";

export function useUploadMediaDropzone(
  addMedia: (type: "image" | "video", url: string) => void,
) {
  const t = useTranslations("uploadMedia");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropzoneOpenRef = useRef<() => void>(null);

  function captureFromCamera() {
    dropzoneOpenRef.current?.();
  }

  async function handleDrop(files: File[]) {
    setError(null);
    setLoading(true);

    const db = await createBrowserClient();

    for (const file of files) {
      const mediaType = getMediaTypeFromMimeType(file.type);
      const originalExtension = getExtensionFromMimeType(file.type);

      if (mediaType === null || originalExtension === null) {
        handleMimeTypeNotSupported();
        continue;
      }

      const extension =
        originalExtension === "heif" ? "jpeg" : originalExtension;
      const fileType = originalExtension === "heif" ? "image/jpeg" : file.type;
      let mediaBuffer = await file.arrayBuffer();
      try {
        if (originalExtension === "heif") {
          mediaBuffer = await convert({
            buffer: new Uint8Array(
              await file.arrayBuffer(),
            ) as unknown as ArrayBuffer,
            format: "JPEG",
            quality: 0.3,
          });
        }
      } catch (error) {
        console.error("Error converting HEIF image:", error);
        handleUnknownError();
        continue;
      }

      if (mediaType === "image") {
        try {
          const image = new Blob([mediaBuffer], { type: fileType });
          mediaBuffer = await compressAsync(
            image,
            getQualityForSize(image.size),
          ).then((res) => res.arrayBuffer());
        } catch (error) {
          console.error("Error compressing image:", error);
          handleUnknownError();
          continue;
        }
      }

      const mediaName = `${randomId(`${mediaType}-`)}.${extension}`;

      const uploadResult = await db.storage
        .from("media")
        .upload(mediaName, mediaBuffer, {
          contentType: fileType,
        })
        .catch((error) => {
          console.log("Error uploading media:", error);
          return null;
        });

      if (!uploadResult || uploadResult.error) {
        if (uploadResult)
          console.error("Error uploading media:", uploadResult.error);

        handleUnknownError();
        continue;
      }

      const {
        data: { publicUrl: url },
      } = db.storage.from("media").getPublicUrl(mediaName);

      addMedia(mediaType, url);
      handleSuccessResponse();
    }

    function handleSuccessResponse() {
      setLoading(false);
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
    case "video/webm":
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
    case "video/webm":
      return "webm";
    default:
      return null;
  }
}

function compressAsync(file: Blob, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    new Compressor(file, {
      quality,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

function getQualityForSize(size: number) {
  console.log("Original size:", size);
  if (size > 5 * 1024 * 1024) return 0.2;
  if (size > 2 * 1024 * 1024) return 0.4;
  if (size > 1 * 1024 * 1024) return 0.6;
  return 0.8;
}
