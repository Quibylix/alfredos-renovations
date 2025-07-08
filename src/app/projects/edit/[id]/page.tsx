import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { EditProjectForm } from "@/features/projects/edit-projects/edit-project-form.component";
import { z } from "zod";
import { notFound } from "next/navigation";
import { Project } from "@/features/db/project/project.model";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";

const propsSchema = z.object({
  params: z.promise(
    z.object({
      id: z.string().regex(/^\d+$/),
    }),
  ),
});

export type EditProjectPageProps = z.infer<typeof propsSchema>;

export default async function EditProjectPage(props: EditProjectPageProps) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    notFound();
  }

  const { id } = await result.data.params;

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
