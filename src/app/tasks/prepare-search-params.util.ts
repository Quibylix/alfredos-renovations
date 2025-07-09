import {
  GetRelatedTasksFilters,
  GetRelatedTasksLimits,
} from "@/features/db/task/queries/get-related-tasks.query";
import { z } from "zod";
import { searchParamsSchema } from "./page.schema";

const TASKS_PER_PAGE = 10;

export function prepareSearchParams(
  searchParams: z.infer<z.SafeParseSuccess<typeof searchParamsSchema>["data"]>,
) {
  const filters: GetRelatedTasksFilters = {
    completed: searchParams.completed,
    startDate: {
      gte: searchParams.start_date_gte
        ? new Date(searchParams.start_date_gte)
        : undefined,
      lte: searchParams.start_date_lte
        ? new Date(searchParams.start_date_lte)
        : undefined,
    },
    endDate: {
      gte: searchParams.end_date_gte
        ? new Date(searchParams.end_date_gte)
        : undefined,
      lte: searchParams.end_date_lte
        ? new Date(searchParams.end_date_lte)
        : undefined,
    },
    title: searchParams.title,
    employeeIds: searchParams.employees?.split(",").map((id) => id.trim()),
    projectId: searchParams.project,
  };

  const limits: GetRelatedTasksLimits = {
    offset: (searchParams.page - 1) * TASKS_PER_PAGE,
    limit: TASKS_PER_PAGE,
  };

  const order = searchParams.order;

  return {
    filters,
    limits,
    order,
  };
}
