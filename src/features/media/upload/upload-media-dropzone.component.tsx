import { Button, Group, Text } from "@mantine/core";
import { IconUpload, IconPhoto, IconX, IconCamera } from "@tabler/icons-react";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useTranslations } from "next-intl";
import { useUploadMediaDropzone } from "./use-upload-media-dropzone.hook";
import { useOs } from "@mantine/hooks";

export type UploadImageDropzoneProps = {
  addMedia: (type: "video" | "image", url: string) => void;
};

const acceptedMimeTypes = [
  MIME_TYPES.png,
  MIME_TYPES.jpeg,
  "image/jpg", // For .jpg files
  MIME_TYPES.webp,
  MIME_TYPES.heif,
  MIME_TYPES.mp4,
  "video/quicktime", // For .mov files
  "video/webm",
];

export function UploadMediaDropzone({ addMedia }: UploadImageDropzoneProps) {
  const t = useTranslations("uploadMedia.dropzone");

  const { handleDrop, loading, error, captureFromCamera, dropzoneOpenRef } =
    useUploadMediaDropzone(addMedia);
  const os = useOs();
  const isMobile = os === "ios" || os === "android";

  return (
    <Group p={0} gap="xs" justify="center">
      <Dropzone
        w="100%"
        onDrop={handleDrop}
        onReject={(files) => console.log(files)}
        maxSize={15 * 1024 ** 2}
        accept={acceptedMimeTypes}
        multiple={true}
        loading={loading}
      >
        {error && (
          <Text size="sm" c="red" mb={10}>
            {error}
          </Text>
        )}
        <Group
          justify="center"
          gap="xl"
          mih={220}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={52}
              color="var(--mantine-color-blue-6)"
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto
              size={52}
              color="var(--mantine-color-dimmed)"
              stroke={1.5}
            />
          </Dropzone.Idle>
          <div>
            <Text size="xl" inline>
              {t("title")}
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              {t("description")}
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Dropzone
        display="none"
        openRef={dropzoneOpenRef}
        onDrop={handleDrop}
        onReject={(files) => console.log(files)}
        maxSize={15 * 1024 ** 2}
        inputProps={{
          capture: "environment",
        }}
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg, "image/jpg", MIME_TYPES.webp]}
        multiple={true}
        loading={loading}
      />
      {isMobile && (
        <Button
          onClick={captureFromCamera}
          mt={10}
          variant="outline"
          leftSection={<IconCamera />}
        >
          {t("capture")}
        </Button>
      )}
    </Group>
  );
}
