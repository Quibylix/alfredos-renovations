import { LoginForm } from "@/features/auth/login/login-form.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function LoginPage() {
  const t = await getTranslations("login");
  return (
    <Container size={420} my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <LoginForm />
    </Container>
  );
}
