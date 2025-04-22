import { RegisterEmployeeForm } from "@/features/auth/register-employee/register-employee-form.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function RegisterEmployeePage() {
  const t = await getTranslations("registerEmployee");

  return (
    <Container size={420} my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <RegisterEmployeeForm />
    </Container>
  );
}
