"use client";

import { Button, Paper, Text, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useCreateProjectForm } from "./use-create-project-form.hook";
import { useClientSide } from "@/features/shared/use-client-side.hook";

export function CreateProjectForm() {
  const formLoaded = useClientSide();
  const { form, submitHandler, error, loading } = useCreateProjectForm();

  const t = useTranslations("createProject.form");

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
        disabled={!formLoaded}
        label={t("title.label")}
        placeholder={t("title.placeholder")}
        required
        key={form.key("title")}
        {...form.getInputProps("title")}
      />
      <Button
        disabled={!formLoaded}
        type="submit"
        fullWidth
        mt="xl"
        loading={loading}
      >
        {t("submit")}
      </Button>
    </Paper>
  );
}
