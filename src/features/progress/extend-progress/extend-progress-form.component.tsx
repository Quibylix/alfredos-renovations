"use client";

import { Button, Paper, Text, Textarea, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useExtendProgressForm } from "./use-extend-progress-form.hook";
import { UploadImageDropzone } from "@/features/images/upload/upload-image-dropzone.component";
import { ImagePreview } from "../send-progress/image-preview.component";

export type ExtendProgressFormProps = {
  projectId: number;
  parentId: number;
};

export function ExtendProgressForm({
  projectId,
  parentId,
}: ExtendProgressFormProps) {
  const { form, submitHandler, imageURL, changeImageURL, error, loading } =
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
        required
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
        required
        mt="md"
        key={form.key("description")}
        {...form.getInputProps("description")}
      />
      <Text size="sm" mt="md" mb={5} fw={500}>
        {t("image.label")}
      </Text>
      {imageURL ? (
        <ImagePreview
          imageURL={imageURL}
          alt={t("image.previewAlt")}
          close={() => changeImageURL("")}
        />
      ) : (
        <UploadImageDropzone setImageURL={changeImageURL} />
      )}
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
