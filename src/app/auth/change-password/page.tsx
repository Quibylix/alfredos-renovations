import { ChangePasswordForm } from "@/features/auth/change-password/change-password-form.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function ChangePasswordPage() {
  const t = await getTranslations("changePassword");

  return (
    <Container size={420} my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <ChangePasswordForm />
    </Container>
  );
}
