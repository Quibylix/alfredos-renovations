import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { getEmployees } from "@/features/employees/get-employees/get-employees.action";
import { Project } from "@/features/db/project/project.model";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { ERROR_CODES } from "@/features/employees/get-employees/error_codes.constant";
import z from "zod";
import { Task } from "@/features/db/task/task.model";
import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";
import { EditTaskForm } from "@/features/tasks/edit-task/edit-task-form.component";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

export default async function EditTaskPage(props: {
  params: Promise<z.infer<typeof paramsSchema>>;
}) {
  const params = await props.params;
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    console.error("Invalid parameters provided for EditTaskPage");
    notFound();
  }

  const t = await getTranslations("editTask");

  const { projects, status } = await Project.getRelatedProjects();

  if (status === PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED) {
    console.error("User is not authorized to access this page");
    redirect(AppRoutes.getRoute("LOGIN"));
  }

  if (status === PROJECT_STATUS_MESSAGES.UNKNOWN) {
    console.error("Unknown error occurred while fetching projects");
    redirect(AppRoutes.getRoute("HOME"));
  }

  const { employees, errorCode: errorCodeEmployees } = await getEmployees();

  if (errorCodeEmployees === ERROR_CODES.NOT_AUTHORIZED) {
    console.error("User is not authorized to access employees");
    redirect(AppRoutes.getRoute("LOGIN"));
  }

  if (errorCodeEmployees === ERROR_CODES.UNKNOWN) {
    console.error("Unknown error occurred while fetching employees");
    redirect(AppRoutes.getRoute("HOME"));
  }

  const taskResult = await Task.getTaskInfo(Number(parsedParams.data.id));

  if (taskResult.status !== TASK_STATUS_MESSAGES.OK || !taskResult.task) {
    console.error("Error fetching task information:", taskResult.status);
    notFound();
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <EditTaskForm
        taskData={taskResult.task}
        projects={projects}
        employees={employees}
      />
    </Container>
  );
}
