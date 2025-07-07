import { Button, Container, Stack, Title } from "@mantine/core";
import { ERROR_CODES } from "@/features/tasks/get-tasks/error_codes.constant";
import { getProgressTree } from "@/features/tasks/get-tasks/get-task-messages.action";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Progress } from "@/features/tasks/get-tasks/task.component";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppRoutes } from "@/features/shared/app-routes.util";

const propsSchema = z.object({
  params: z.promise(
    z.object({
      id: z.string().regex(/^\d+$/),
    }),
  ),
});

export type ProgressPageProps = z.infer<typeof propsSchema>;

export default async function ProgressPage(props: ProgressPageProps) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    notFound();
  }

  const { id } = await result.data.params;

  const { errorCode, task, messages } = await getProgressTree(Number(id));

  if (errorCode !== ERROR_CODES.SUCCESS) {
    notFound();
  }

  if (task === null) {
    notFound();
  }

  const t = await getTranslations("progress");

  return (
    <Container size="md" my={20}>
      <Title order={1} mb="xl" ta="center">
        {task.title}
      </Title>
      <Stack gap="lg">
        <Progress data={task} />
        {messages.map((p) => (
          <Progress key={p.id} data={task} />
        ))}
        <Button
          variant="outline"
          component={Link}
          href={AppRoutes.getRoute("EXTEND_PROGRESS") + `?taskId=${task.id}`}
        >
          {t("extend")}
        </Button>
      </Stack>
    </Container>
  );
}
