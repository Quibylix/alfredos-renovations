import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";
import { firebaseMessaging } from "@/lib/firebase-admin";
import { getTranslations } from "next-intl/server";

export type EditTaskNewData = {
  title?: string;
  description?: string;
  projectId?: number;
  startDate?: Date;
  endDate?: Date;
  completed?: boolean;
  newEmployees?: string[];
  removedEmployees?: string[];
  newMedia?: {
    type: "image" | "video";
    url: string;
  }[];
  removedMedia?: number[];
};

export class EditTask {
  private taskId: number;
  private newData: EditTaskNewData;
  private newEmployeesFcmTokens: string[] = [];

  constructor(taskId: number, newData: EditTaskNewData) {
    this.taskId = taskId;
    this.newData = newData;
  }

  async execute(): Promise<TaskStatusMessage> {
    const userRole = await User.getRole();

    if (userRole !== "boss") {
      return TASK_STATUS_MESSAGES.NOT_AUTHORIZED;
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error updating task:", error);
      return null;
    });

    return this.handleQueryResult(queryResult);
  }

  private async executeQuery() {
    await this.executeNewEmployeesQuery();
    await this.executeRemovedEmployeesQuery();
    await this.executeNewMediaQuery();
    await this.executeRemovedMediaQuery();

    const taskTableData = {
      ...this.newData,
    };

    delete taskTableData.newEmployees;
    delete taskTableData.removedEmployees;

    const newData = {
      ...taskTableData,
      start_date: this.newData.startDate ?? undefined,
      end_date: this.newData.endDate ?? undefined,
      project_id: this.newData.projectId ?? undefined,
    };

    delete newData.newMedia;
    delete newData.removedMedia;
    delete newData.newEmployees;
    delete newData.removedEmployees;
    delete newData.startDate;
    delete newData.endDate;
    delete newData.projectId;

    const data = await prisma.task.update({
      where: { id: this.taskId },
      select: { id: true, title: true },
      data: newData,
    });

    if (this.newEmployeesFcmTokens.length === 0) {
      return data;
    }

    const t = await getTranslations("editTask.notification");
    await firebaseMessaging.sendEachForMulticast({
      tokens: this.newEmployeesFcmTokens,
      data: {
        title: t("title"),
        body: t("body", { title: data.title }),
      },
    });

    return data;
  }

  private async executeNewEmployeesQuery() {
    if (!this.newData.newEmployees || this.newData.newEmployees.length === 0) {
      return null;
    }

    const data = await prisma.task_assignment.createManyAndReturn({
      data: this.newData.newEmployees.map((employeeId) => ({
        task_id: this.taskId,
        employee_id: employeeId,
      })),
      select: {
        employee: {
          select: {
            profile: {
              select: {
                profile_fcm_token: { select: { token: true } },
              },
            },
          },
        },
      },
      skipDuplicates: true,
    });

    this.newEmployeesFcmTokens = data.flatMap((assignment) =>
      assignment.employee.profile.profile_fcm_token.map((token) => token.token),
    );
  }

  private async executeRemovedEmployeesQuery() {
    if (
      !this.newData.removedEmployees ||
      this.newData.removedEmployees.length === 0
    ) {
      return null;
    }

    await prisma.task_assignment.deleteMany({
      where: {
        task_id: this.taskId,
        employee_id: {
          in: this.newData.removedEmployees,
        },
      },
    });
  }

  private async executeNewMediaQuery() {
    if (!this.newData.newMedia || this.newData.newMedia.length === 0) {
      return null;
    }

    return prisma.task_media.createMany({
      data: this.newData.newMedia.map((media) => ({
        task_id: this.taskId,
        type: media.type,
        url: media.url,
      })),
      skipDuplicates: true,
    });
  }

  private async executeRemovedMediaQuery() {
    if (!this.newData.removedMedia || this.newData.removedMedia.length === 0) {
      return null;
    }

    return prisma.task_media.deleteMany({
      where: {
        task_id: this.taskId,
        id: {
          in: this.newData.removedMedia,
        },
      },
    });
  }

  private handleQueryResult(queryData: unknown) {
    if (queryData === null) {
      return TASK_STATUS_MESSAGES.UNKNOWN;
    }

    const mappedData = this.mapQueryResultToTaskData(queryData);

    if (!mappedData) {
      return TASK_STATUS_MESSAGES.UNKNOWN;
    }

    return TASK_STATUS_MESSAGES.OK;
  }

  private mapQueryResultToTaskData(queryData: unknown) {
    const result = querySchema.safeParse(queryData);

    if (!result.success) {
      console.error("Invalid query result:", result.error);
      return null;
    }

    return {
      id: result.data.id,
    };
  }
}

const querySchema = z.object({
  id: z.bigint(),
  title: z.string(),
});
