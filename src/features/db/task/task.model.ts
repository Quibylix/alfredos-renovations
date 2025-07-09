import {
  GetRelatedTasks,
  GetRelatedTasksFilters,
  GetRelatedTasksLimits,
} from "./queries/get-related-tasks.query";

export class Task {
  static getRelatedTasks(
    filters?: GetRelatedTasksFilters,
    limits?: GetRelatedTasksLimits,
  ) {
    return new GetRelatedTasks(filters, limits).execute();
  }
}
