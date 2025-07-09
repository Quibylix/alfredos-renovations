import { GetRelatedTasks } from "./queries/get-related-tasks.query";

export class Task {
  static getRelatedTasks() {
    return new GetRelatedTasks().execute();
  }
}
