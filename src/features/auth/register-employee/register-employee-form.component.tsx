"use client";

import { Button, Paper, PasswordInput, Text, TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRegisterEmployeeForm } from "./use-register-employee-form.hook";

export function RegisterEmployeeForm() {
  const { form, submitHandler, error, loading } = useRegisterEmployeeForm();

  const t = useTranslations("registerEmployee.form");

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
        label={t("username.label")}
        placeholder={t("username.placeholder")}
        required
        key={form.key("username")}
        {...form.getInputProps("username")}
      />
      <TextInput
        label={t("fullName.label")}
        placeholder={t("fullName.placeholder")}
        required
        mt="md"
        key={form.key("fullName")}
        {...form.getInputProps("fullName")}
      />
      <PasswordInput
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        required
        mt="md"
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <PasswordInput
        label={t("confirmPassword.label")}
        placeholder={t("confirmPassword.placeholder")}
        required
        mt="md"
        key={form.key("confirmPassword")}
        {...form.getInputProps("confirmPassword")}
      />
      <Button type="submit" fullWidth mt="xl" loading={loading}>
        {t("submit")}
      </Button>
    </Paper>
  );
}
