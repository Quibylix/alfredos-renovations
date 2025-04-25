"use client";

import {
  Button,
  Paper,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import { useSendProgressForm } from "./use-send-progress-form.hook";
import { UploadImageDropzone } from "@/features/images/upload/upload-image-dropzone.component";
import { ImagePreview } from "./image-preview.component";

export type SendProgressFormProps = {
  projects: { id: number; title: string }[];
};

export function SendProgressForm({ projects }: SendProgressFormProps) {
  const { form, submitHandler, imageURL, changeImageURL, error, loading } =
    useSendProgressForm();

  const t = useTranslations("sendProgress.form");

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
      <Select
        label={t("project.label")}
        placeholder={t("project.placeholder")}
        data={projects.map((project) => ({
          value: project.id.toString(),
          label: project.title,
        }))}
        required
        key={form.key("projectId")}
        {...form.getInputProps("projectId")}
        searchable
      />
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
