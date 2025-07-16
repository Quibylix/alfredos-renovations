import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { EditProjectForm } from "@/features/projects/edit-projects/edit-project-form.component";
import { z } from "zod";
import { notFound } from "next/navigation";
import { Project } from "@/features/db/project/project.model";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export type EditProjectPageProps = {
  params: Promise<z.infer<typeof paramsSchema>>;
};

export default async function EditProjectPage(props: EditProjectPageProps) {
  const params = await props.params;

  const result = paramsSchema.safeParse(params);

  if (!result.success) {
    notFound();
  }

  const { id } = result.data;

  const { status, project } = await Project.getProjectInfo(Number(id));

  if (status !== PROJECT_STATUS_MESSAGES.OK) {
    notFound();
  }

  if (project === null) {
    notFound();
  }

  const t = await getTranslations("editProject");

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <EditProjectForm id={Number(id)} initialTitle={project.title} />
    </Container>
  );
}
