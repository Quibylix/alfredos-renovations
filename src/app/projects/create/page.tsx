import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { CreateProjectForm } from "@/features/projects/create-project/create-project-form.component";

export default async function CreateProjectPage() {
  const t = await getTranslations("createProject");

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <CreateProjectForm />
    </Container>
  );
}
