import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { EditProjectForm } from "@/features/projects/edit-projects/edit-project-form.component";
import { ERROR_CODES } from "@/features/employees/get-employees/error_codes.constant";
import { z } from "zod";
import { notFound } from "next/navigation";
import { getProjectInfo } from "@/features/projects/get-projects/get-project-info.action";
import { getEmployees } from "@/features/employees/get-employees/get-employees.action";

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

  const { errorCode, project } = await getProjectInfo(Number(id));

  if (errorCode !== ERROR_CODES.SUCCESS) {
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
