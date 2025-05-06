"use client";

import { Button, Paper, PasswordInput, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useChangePasswordForm } from "./use-change-password-form.hook";

export function ChangePasswordForm() {
  const { form, submitHandler, error, loading } = useChangePasswordForm();

  const t = useTranslations("changePassword.form");

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
      <PasswordInput
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        required
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
