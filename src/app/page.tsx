import { ERROR_CODES } from "@/features/progress/get-progress/error_codes.constant";
import { getRelatedProgress } from "@/features/progress/get-progress/get-related-progress.action";
import { ProgressList } from "@/features/progress/get-progress/progress-list.component";
import { getRelatedProjects } from "@/features/projects/get-projects/get-related-projects.action";
import { ProjectList } from "@/features/projects/get-projects/project-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  const progressResult = await getRelatedProgress();

  if (progressResult.errorCode !== ERROR_CODES.SUCCESS) {
    return null;
  }

  const projectsResult = await getRelatedProjects();

  if (projectsResult.errorCode !== ERROR_CODES.SUCCESS) {
    return null;
  }

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <Container component="section" fluid mt="lg">
        <Title order={2} mb="md" fw={700}>
          {t("progress")}
        </Title>
        <ProgressList progress={progressResult.tasks} />
      </Container>
      <Container component="section" fluid mt={45}>
        <Title order={2} mb="md" fw={700}>
          {t("projects")}
        </Title>
        <ProjectList projects={projectsResult.projects} />
      </Container>
    </Container>
  );
}
