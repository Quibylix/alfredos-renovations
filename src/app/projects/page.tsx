import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { Project } from "@/features/db/project/project.model";
import { ProjectList } from "@/features/projects/get-projects/project-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function ProjectsPage() {
  const t = await getTranslations("projects");

  const result = await Project.getRelatedProjects();

  if (result.status !== PROJECT_STATUS_MESSAGES.OK) {
    return null;
  }

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <ProjectList projects={result.projects} />
    </Container>
  );
}
