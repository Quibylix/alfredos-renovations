import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { CreateProjectForm } from "@/features/projects/create-project/create-project-form.component";
import { getEmployees } from "@/features/employees/get-employees/get-employees.action";
import { ERROR_CODES } from "@/features/employees/get-employees/error_codes.constant";

export default async function CreateProjectPage() {
  const t = await getTranslations("createProject");

  const { employees, errorCode } = await getEmployees();

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    return null;
  }

  if (errorCode === ERROR_CODES.UNKNOWN) {
    return null;
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <CreateProjectForm employees={employees} />
    </Container>
  );
}
