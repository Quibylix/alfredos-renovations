import { Button, Container, Group, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { IconEdit } from "@tabler/icons-react";
import { User } from "@/features/db/user/user.model";
import { USER_ROLES } from "@/features/db/user/user.constant";
import { TaskList } from "@/features/tasks/get-tasks/task-list.component";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { Project } from "@/features/db/project/project.model";

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

  const { status, project } = await Project.getProjectInfo(Number(id));

  if (status !== PROJECT_STATUS_MESSAGES.OK) {
    notFound();
  }

  if (project === null) {
    notFound();
  }

  const userRole = await User.getRole();

  const t = await getTranslations("project");

  return (
    <Container size="md" my={20}>
      <Title order={1} ta="center">
        {project.title}
      </Title>
      {userRole === USER_ROLES.BOSS && (
        <Group justify="center">
          <Button
            variant="outline"
            component={Link}
            href={`/projects/edit/${project.id}`}
            color="dimmed"
            mt="sm"
          >
            {t("edit")}
            <IconEdit size={20} />
          </Button>
        </Group>
      )}
      <Container component="section" fluid mt={40}>
        <Title order={2} mb="lg">
          {t("tasks")}
        </Title>
        <TaskList tasks={project.tasks} />
      </Container>
    </Container>
  );
}
