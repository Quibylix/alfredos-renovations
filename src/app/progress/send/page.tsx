import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { SendProgressForm } from "@/features/progress/send-progress/send-progress-form.component";

export default async function SendProgressPage() {
  const t = await getTranslations("sendProgress");

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <SendProgressForm />
    </Container>
  );
}
