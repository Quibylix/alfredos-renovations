import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function LoginForm() {
  const t = useTranslations("login.form");

  return (
    <Paper withBorder shadow="md" p={30} radius="md">
      <TextInput
        label={t("username.label")}
        placeholder={t("username.placeholder")}
        required
      />
      <PasswordInput
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        required
        mt="md"
      />
      <Group justify="space-between" mt="lg">
        <Anchor component={Link} href="/auth/forgot-password" size="sm">
          {t("forgotPassword")}
        </Anchor>
      </Group>
      <Button fullWidth mt="xl">
        {t("submit")}
      </Button>
    </Paper>
  );
}
