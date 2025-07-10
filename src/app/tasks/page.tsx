import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";
import { Task } from "@/features/db/task/task.model";
import { TaskList } from "@/features/tasks/get-tasks/task-list.component";
import { Container, Group, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { prepareSearchParams } from "./prepare-search-params.util";
import { searchParamsSchema } from "./page.schema";
import { z } from "zod";
import { TaskFilter } from "@/features/tasks/filter-tasks/task-filter.component";
import { TaskPagination } from "@/features/tasks/task-pagination/task-pagination.component";

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

  const taskCountResult = await Task.getRelatedTasksCount()
    .withFilters(filters)
    .execute();

  return (
    <Container size="md" my={20}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <TaskFilter />
      {taskCountResult.status === TASK_STATUS_MESSAGES.OK && (
        <Group w="100%" justify="center" mb="xl">
          <TaskPagination
            currentPage={searchParams.page}
            totalPages={Math.ceil(taskCountResult.count / 10)}
          />
        </Group>
      )}
      <TaskList tasks={result.tasks} />
      {taskCountResult.status === TASK_STATUS_MESSAGES.OK && (
        <Group w="100%" justify="center" mt="xl">
          <TaskPagination
            currentPage={searchParams.page}
            totalPages={Math.ceil(taskCountResult.count / 10)}
          />
        </Group>
      )}
    </Container>
  );
}
