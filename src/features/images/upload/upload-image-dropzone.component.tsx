import { Button, Group, Text } from "@mantine/core";
import { IconUpload, IconPhoto, IconX, IconCamera } from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";
import { useTranslations } from "next-intl";
import { useUploadImageDropzone } from "./use-upload-image-dropzone.hook";
import { useOs } from "@mantine/hooks";

export type UploadImageDropzoneProps = {
  setImageURL: (url: string) => void;
};

export function UploadImageDropzone({ setImageURL }: UploadImageDropzoneProps) {
  const t = useTranslations("uploadImage.dropzone");

  const { handleDrop, loading, error, captureFromCamera, dropzoneOpenRef } =
    useUploadImageDropzone(setImageURL);
  const os = useOs();
  const isMobile = os === "ios" || os === "android";

  return (
    <Group p={0} gap="xs" justify="center">
      <Dropzone
        w="100%"
        onDrop={handleDrop}
        onReject={(files) => console.log(files)}
        maxSize={5 * 1024 ** 2}
        accept={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
        multiple={false}
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
        maxSize={5 * 1024 ** 2}
        inputProps={{
          capture: "environment",
        }}
        accept={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
        multiple={false}
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
