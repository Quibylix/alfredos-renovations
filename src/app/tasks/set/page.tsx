import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { SetTaskForm } from "@/features/tasks/set-task/set-task-form.component";
import { redirect } from "next/navigation";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { getEmployees } from "@/features/employees/get-employees/get-employees.action";
import { Project } from "@/features/db/project/project.model";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";
import { ERROR_CODES } from "@/features/employees/get-employees/error_codes.constant";

export default async function SetTaskPage() {
  const t = await getTranslations("setTask");

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

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <SetTaskForm projects={projects} employees={employees} />
    </Container>
  );
}
