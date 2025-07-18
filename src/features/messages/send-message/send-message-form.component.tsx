"use client";

import { Button, Paper, Text, Textarea } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useSendMessageForm } from "./use-send-message-form.hook";
import { UploadMediaDropzone } from "@/features/media/upload/upload-media-dropzone.component";
import { MediaUploadPreview } from "@/features/media/upload/media-upload-preview.component";

export type SendMessageFormProps = {
  taskId: number;
};

export function SendMessageForm({ taskId }: SendMessageFormProps) {
  const { form, submitHandler, media, addMedia, removeMedia, error, loading } =
    useSendMessageForm(taskId);

  const t = useTranslations("sendMessage.form");

  return (
    <Paper
      component="form"
      onSubmit={submitHandler}
      withBorder
      shadow="md"
      p={30}
      radius="md"
    >
      {error && (
        <Text size="sm" c="red" mb={10}>
          {error}
        </Text>
      )}
      <Textarea
        autosize
        rows={4}
        minRows={4}
        maxRows={8}
        label={t("content.label")}
        placeholder={t("content.placeholder")}
        mt="md"
        key={form.key("description")}
        {...form.getInputProps("content")}
      />
      <Text size="sm" mt="md" mb={5} fw={500}>
        {t("media.label")}
      </Text>
      <MediaUploadPreview media={media} removeMedia={removeMedia} />
      <UploadMediaDropzone addMedia={addMedia} />
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
