"use client";

import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLoginForm } from "./use-login-form.hook";
import { useClientSide } from "@/features/shared/use-client-side.hook";

export function LoginForm() {
  const formLoaded = useClientSide();
  const { form, submitHandler, error, loading } = useLoginForm();

  const t = useTranslations("login.form");

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
        label={t("username.label")}
        placeholder={t("username.placeholder")}
        required
        key={form.key("username")}
        {...form.getInputProps("username")}
      />
      <PasswordInput
        disabled={!formLoaded}
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        required
        mt="md"
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <Group justify="space-between" mt="lg">
        <Anchor component={Link} href="/auth/forgot-password" size="sm">
          {t("forgotPassword")}
        </Anchor>
      </Group>
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
