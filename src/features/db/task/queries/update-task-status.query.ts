import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../user/user.constant";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";
import { getTranslations } from "next-intl/server";
import { firebaseMessaging } from "@/lib/firebase-admin";

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

    const data = await prisma.task.update({
      where: whereCondition,
      data: {
        completed: this.newStatus,
      },
      select: selectedColumns,
    });

    await this.sendNotifications(data.title);

    return data;
  }

  private getWhereCondition() {
    return {
      id: this.taskId,
    };
  }

  private getSelectedColumns() {
    return {
      id: true,
      title: true,
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

  private async sendNotifications(taskTitle: string) {
    const t = await getTranslations("updateTaskStatus");

    const fcmTokens = await this.getFcmTokens(this.taskId, this.userId);

    if (fcmTokens.length === 0) {
      return;
    }

    await firebaseMessaging.sendEachForMulticast({
      tokens: fcmTokens,
      data: {
        title: t("notification.title"),
        body: t("notification.body", {
          taskTitle,
          status: this.newStatus ? t("completed") : t("pending"),
        }),
      },
    });
  }

  private async getFcmTokens(taskId: number, userId: string | null) {
    const bossFCMTokens = await prisma.boss.findMany({
      where: {
        NOT: {
          id: userId!,
        },
      },
      select: {
        profile: {
          select: {
            profile_fcm_token: {
              select: {
                token: true,
              },
            },
          },
        },
      },
    });

    const employeeFCMTokens = await prisma.task_assignment.findMany({
      where: {
        task_id: taskId,
      },
      select: {
        employee: {
          select: {
            profile: {
              select: {
                profile_fcm_token: {
                  select: {
                    token: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return [
      ...bossFCMTokens.flatMap((boss) =>
        boss.profile.profile_fcm_token.map((token) => token.token),
      ),
      ...employeeFCMTokens.flatMap((assignment) =>
        assignment.employee.profile.profile_fcm_token.map(
          (token) => token.token,
        ),
      ),
    ];
  }
}

const querySchema = z.object({
  id: z.bigint(),
  title: z.string(),
});
