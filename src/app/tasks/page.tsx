import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";
import { Task } from "@/features/db/task/task.model";
import { TaskList } from "@/features/tasks/get-tasks/task-list.component";
import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { prepareSearchParams } from "./prepare-search-params.util";
import { searchParamsSchema } from "./page.schema";
import { z } from "zod";

export type SendMessagePageProps = {
  searchParams: Promise<z.infer<typeof searchParamsSchema>>;
};

export default async function TasksPage(props: SendMessagePageProps) {
  const rawSearchParams = await props.searchParams;
  const parsedResult = searchParamsSchema.safeParse(rawSearchParams);

  if (!parsedResult.success) {
    return null;
  }

  const searchParams = parsedResult.data;

  const { filters, limits, order } = prepareSearchParams(searchParams);

  const t = await getTranslations("task");

  const result = await Task.getRelatedTasks()
    .withFilters(filters)
    .withLimits(limits)
    .withOrder(order)
    .execute();

  if (result.status !== TASK_STATUS_MESSAGES.OK) {
    return null;
  }

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <TaskList tasks={result.tasks} />
    </Container>
  );
}
