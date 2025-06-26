"use client";

import { Button, Paper, Text, Textarea, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useExtendProgressForm } from "./use-extend-progress-form.hook";
import { UploadMediaDropzone } from "@/features/media/upload/upload-media-dropzone.component";
import { MediaUploadPreview } from "@/features/media/upload/media-upload-preview.component";

export type ExtendProgressFormProps = {
  projectId: number;
  parentId: number;
};

export function ExtendProgressForm({
  projectId,
  parentId,
}: ExtendProgressFormProps) {
  const { form, submitHandler, media, addMedia, removeMedia, error, loading } =
    useExtendProgressForm(projectId, parentId);

  const t = useTranslations("extendProgress.form");

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
      <TextInput
        label={t("title.label")}
        placeholder={t("title.placeholder")}
        mt="md"
        key={form.key("title")}
        {...form.getInputProps("title")}
      />
      <Textarea
        autosize
        rows={4}
        minRows={4}
        maxRows={8}
        label={t("description.label")}
        placeholder={t("description.placeholder")}
        mt="md"
        key={form.key("description")}
        {...form.getInputProps("description")}
      />
      <Text size="sm" mt="md" mb={5} fw={500}>
        {t("image.label")}
      </Text>
      <MediaUploadPreview media={media} removeMedia={removeMedia} />
      <UploadMediaDropzone addMedia={addMedia} />
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
