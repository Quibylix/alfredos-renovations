"use client";

import { Paper, Text, TextInput, MultiSelect, Button } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEditProjectForm } from "./use-edit-project-form.hook";

export type EditProjectFormProps = {
  id: number;
  initialTitle: string;
  employees: {
    id: string;
    fullName: string;
  }[];
  initialEmployees: {
    id: string;
    fullName: string;
  }[];
};

export function EditProjectForm({
  id,
  initialTitle,
  employees,
  initialEmployees,
}: EditProjectFormProps) {
  const { form, submitHandler, error, loading } = useEditProjectForm({
    id,
    initialTitle,
    initialEmployees: initialEmployees.map((employee) => employee.id),
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
        key={form.key("employees")}
        {...form.getInputProps("employees")}
      />
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
