import { ERROR_CODES } from "@/features/progress/get-progress/error_codes.constant";
import { getRelatedProgress } from "@/features/progress/get-progress/get-related-progress.action";
import { ProgressList } from "@/features/progress/get-progress/progress-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const result = await getRelatedProgress();

  if (result.errorCode !== ERROR_CODES.SUCCESS) {
    return null;
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <ProgressList progress={result.progress} />
    </Container>
  );
}
