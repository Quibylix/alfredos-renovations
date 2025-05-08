import { Button, Container, Group, Title } from "@mantine/core";
import { ERROR_CODES } from "@/features/projects/get-projects/error_codes.constant";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { getProjectInfo } from "@/features/projects/get-projects/get-project-info.action";
import { ProgressList } from "@/features/progress/get-progress/progress-list.component";
import { EmployeeList } from "@/features/employees/get-employees/employee-list.component";
import Link from "next/link";
import { IconEdit } from "@tabler/icons-react";
import { User } from "@/features/db/user/user.model";
import { USER_ROLES } from "@/features/db/user/user.constant";

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
      {project.employees && (
        <Container component="section" fluid mt="xl">
          <Title order={2} mb="lg">
            {t("employees")}
          </Title>
          <EmployeeList employees={project.employees} />
        </Container>
      )}
      <Container component="section" fluid mt={40}>
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
