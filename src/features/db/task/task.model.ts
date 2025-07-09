import {
  GetRelatedTasks,
  GetRelatedTasksFilters,
} from "./queries/get-related-tasks.query";

export class Task {
  static getRelatedTasks(filters?: GetRelatedTasksFilters) {
    return new GetRelatedTasks(filters).execute();
  }
}
