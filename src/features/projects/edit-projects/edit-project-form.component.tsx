"use client";

import { Paper, Text, TextInput, Button } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEditProjectForm } from "./use-edit-project-form.hook";

export type EditProjectFormProps = {
  id: number;
  initialTitle: string;
};

export function EditProjectForm({ id, initialTitle }: EditProjectFormProps) {
  const { form, submitHandler, error, loading } = useEditProjectForm({
    id,
    initialTitle,
  });

  const t = useTranslations("editProject.form");

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
        key={form.key("title")}
        {...form.getInputProps("title")}
      />
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
