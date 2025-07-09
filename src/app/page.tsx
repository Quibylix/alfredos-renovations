import { TaskList } from "@/features/tasks/get-tasks/task-list.component";
import { ProjectList } from "@/features/projects/get-projects/project-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { Project } from "@/features/db/project/project.model";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { Task } from "@/features/db/task/task.model";
import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";

export default async function HomePage() {
  const t = await getTranslations("home");

  const taskResult = await Task.getRelatedTasks();

  if (taskResult.status !== TASK_STATUS_MESSAGES.OK) {
    return null;
  }

  const projectsResult = await Project.getRelatedProjects();

  if (projectsResult.status !== PROJECT_STATUS_MESSAGES.OK) {
    return null;
  }

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <Container component="section" fluid mt="lg">
        <Title order={2} mb="md" fw={700}>
          {t("tasks")}
        </Title>
        <TaskList tasks={taskResult.tasks} />
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
