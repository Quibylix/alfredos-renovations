import { ERROR_CODES } from "@/features/projects/get-projects/error_codes.constant";
import { getRelatedProjects } from "@/features/projects/get-projects/get-related-projects.action";
import { ProjectList } from "@/features/projects/get-projects/project-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function ProjectsPage() {
  const t = await getTranslations("projects");

  const result = await getRelatedProjects();

  if (result.errorCode !== ERROR_CODES.SUCCESS) {
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
