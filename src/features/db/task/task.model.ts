import { GetRelatedTasksCount } from "./queries/get-related-tasks-count.query";
import { GetRelatedTasks } from "./queries/get-related-tasks.query";

export class Task {
  static getRelatedTasks() {
    return new GetRelatedTasks();
  }

  static getRelatedTasksCount() {
    return new GetRelatedTasksCount();
  }
}
