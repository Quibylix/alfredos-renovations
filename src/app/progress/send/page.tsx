import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { SendProgressForm } from "@/features/progress/send-progress/send-progress-form.component";
import { getRelatedProjects } from "@/features/projects/get-projects/get-related-projects.action";
import { ERROR_CODES } from "@/features/projects/get-projects/error_codes.constant";
import { redirect } from "next/navigation";
import { AppRoutes } from "@/features/shared/app-routes.util";

export default async function SendProgressPage() {
  const t = await getTranslations("sendProgress");

  const { projects, errorCode } = await getRelatedProjects();

  if (errorCode === ERROR_CODES.NOT_AUTHORIZED) {
    console.error("User is not authorized to access this page");
    redirect(AppRoutes.getRoute("LOGIN"));
  }

  if (errorCode === ERROR_CODES.UNKNOWN) {
    console.error("Unknown error occurred while fetching projects");
    redirect(AppRoutes.getRoute("HOME"));
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <SendProgressForm projects={projects} />
    </Container>
  );
}
