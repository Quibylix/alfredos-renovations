"use client";

import {
  Button,
  MultiSelect,
  Paper,
  Select,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import { useSetTaskForm } from "./use-set-task-form.hook";
import { UploadMediaDropzone } from "@/features/media/upload/upload-media-dropzone.component";
import { MediaUploadPreview } from "@/features/media/upload/media-upload-preview.component";

export type SetTaskFormProps = {
  projects: { id: number; title: string }[];
  employees: { id: string; fullName: string }[];
};

export function SetTaskForm({ projects, employees }: SetTaskFormProps) {
  const { form, submitHandler, media, addMedia, removeMedia, error, loading } =
    useSetTaskForm();

  const t = useTranslations("setTask.form");

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
      <DatePickerInput
        type="range"
        label={t("dateRange.label")}
        placeholder={t("dateRange.placeholder")}
        mt="md"
        required
        key={form.key("dateRange")}
        {...form.getInputProps("dateRange")}
      />
      <MultiSelect
        mt="md"
        label={t("employees.label")}
        placeholder={t("employees.placeholder")}
        data={employees.map((employee) => ({
          value: employee.id,
          label: employee.fullName,
        }))}
        limit={10}
        hidePickedOptions
        searchable
        required
        key={form.key("employees")}
        {...form.getInputProps("employees")}
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
