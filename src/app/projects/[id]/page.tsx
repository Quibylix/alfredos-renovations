import { Avatar, Container, Group, Paper, Text, Title } from "@mantine/core";
import { ERROR_CODES } from "@/features/projects/get-projects/error_codes.constant";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { getProjectInfo } from "@/features/projects/get-projects/get-project-info.action";
import { ProgressList } from "@/features/progress/get-progress/progress-list.component";

const propsSchema = z.object({
  params: z.promise(
    z.object({
      id: z.string().regex(/^\d+$/),
    }),
  ),
});

export type ProgressPageProps = z.infer<typeof propsSchema>;

export default async function ProjectPage(props: ProgressPageProps) {
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

  const t = await getTranslations("project");

  return (
    <Container size="md" my={20}>
      <Title order={1} mb="xl" ta="center">
        {project.title}
      </Title>
      {project.employees && (
        <Container component="section" fluid mt="lg">
          <Title order={2} mb="lg">
            {t("employees")}
          </Title>
          <Group gap="lg">
            {project.employees.map((employee) => (
              <Paper key={employee.id} p="sm" bg="dark.6" radius="md">
                <Group gap="sm">
                  <Avatar
                    size={30}
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    radius={30}
                  />
                  <Text fz="sm" fw={500}>
                    {employee.fullName}
                  </Text>
                </Group>
              </Paper>
            ))}
          </Group>
        </Container>
      )}
      <Container component="section" fluid mt="lg">
        <Title order={2} mb="lg">
          {t("progress")}
        </Title>
        <ProgressList
          progress={project.progress.map((progress) => ({
            id: progress.id,
            title: progress.title,
            description: progress.description,
            sent_date: progress.sentDate,
            image_url: progress.imageUrl,
            parent_id: null,
            employee: {
              id: progress.employee.id,
              full_name: progress.employee.fullName,
            },
            project: {
              id: project.id,
              title: project.title,
            },
          }))}
        />
      </Container>
    </Container>
  );
}
