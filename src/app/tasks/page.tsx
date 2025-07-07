import { ERROR_CODES } from "@/features/tasks/get-tasks/error_codes.constant";
import { getRelatedProgress } from "@/features/tasks/get-tasks/get-related-tasks.action";
import { ProgressList } from "@/features/tasks/get-tasks/task-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function ProgressPage() {
  const t = await getTranslations("progress");

  const result = await getRelatedProgress();

  if (result.errorCode !== ERROR_CODES.SUCCESS) {
    return null;
  }

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <ProgressList progress={result.tasks} />
    </Container>
  );
}
