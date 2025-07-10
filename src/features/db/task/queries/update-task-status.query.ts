import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../user/user.constant";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";

export class UpdateTaskStatus {
  private userId: string | null = null;
  private userRole: string | null = null;

  private taskId: number;
  private newStatus: boolean;

  constructor(taskId: number, newStatus: boolean) {
    this.taskId = taskId;
    this.newStatus = newStatus;
  }

  async execute(): Promise<TaskStatusMessage> {
    await this.getUserInfo();

    if (this.userRole !== USER_ROLES.BOSS) {
      return TASK_STATUS_MESSAGES.NOT_AUTHORIZED;
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error updating task:", error);
      return null;
    });

    return this.handleQueryResult(queryResult);
  }

  private async getUserInfo() {
    this.userId = await User.getCurrentUserId();
    this.userRole = await User.getRole(this.userId);
  }

  private async executeQuery() {
    const whereCondition = this.getWhereCondition();
    const selectedColumns = this.getSelectedColumns();

    return prisma.task.update({
      where: whereCondition,
      data: {
        completed: this.newStatus,
      },
      select: selectedColumns,
    });
  }

  private getWhereCondition() {
    return {
      id: this.taskId,
    };
  }

  private getSelectedColumns() {
    return {
      id: true,
    };
  }

  private handleQueryResult(queryResult: unknown) {
    if (queryResult === null) {
      return TASK_STATUS_MESSAGES.UNKNOWN;
    }

    const task = this.mapQueryResultToTaskData(queryResult);

    if (task === null) {
      console.error("Invalid query result format");
      return TASK_STATUS_MESSAGES.UNKNOWN;
    }

    return TASK_STATUS_MESSAGES.OK;
  }

  private mapQueryResultToTaskData(queryResult: unknown) {
    const result = querySchema.safeParse(queryResult);

    if (!result.success) {
      console.error("Invalid query result:", result.error);
      return null;
    }

    const rawTask = result.data;

    return {
      id: Number(rawTask.id),
    };
  }
}

const querySchema = z.object({
  id: z.bigint(),
});
