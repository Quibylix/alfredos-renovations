import { EditTask, EditTaskNewData } from "./queries/edit-task.query";
import { GetRelatedTasksCount } from "./queries/get-related-tasks-count.query";
import { GetRelatedTasks } from "./queries/get-related-tasks.query";
import { UpdateTaskStatus } from "./queries/update-task-status.query";

export class Task {
  static getRelatedTasks() {
    return new GetRelatedTasks();
  }

  static getRelatedTasksCount() {
    return new GetRelatedTasksCount();
  }

  static updateTaskStatus(taskId: number, completed: boolean) {
    return new UpdateTaskStatus(taskId, completed).execute();
  }

  static editTask(taskId: number, newData: EditTaskNewData) {
    return new EditTask(taskId, newData).execute();
  }
}
