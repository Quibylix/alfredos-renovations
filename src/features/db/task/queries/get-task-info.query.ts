import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../user/user.constant";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";
import { TaskData } from "../../task/task.types";

export class GetTaskInfo {
  private userId: string | null = null;
  private userRole: string | null = null;

  private taskId: number;

  constructor(taskId: number) {
    this.taskId = taskId;
  }

  async execute(): Promise<{
    status: TaskStatusMessage;
    task: TaskData | null;
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return { status: TASK_STATUS_MESSAGES.NOT_AUTHORIZED, task: null };
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error fetching tasks:", error);
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

    return prisma.task.findUnique({
      where: whereCondition,
      select: selectedColumns,
    });
  }

  private getWhereCondition() {
    if (this.userRole === USER_ROLES.BOSS) {
      return { id: this.taskId };
    }

    return {
      id: this.taskId,
      task_assignment: {
        some: { employee_id: this.userId! },
      },
    };
  }

  private getSelectedColumns() {
    return {
      id: true,
      title: true,
      description: true,
      start_date: true,
      end_date: true,
      completed: true,
      created_at: true,
      task_media: {
        select: { id: true, type: true, url: true },
      },
      boss: {
        select: {
          id: true,
          profile: { select: { full_name: true } },
        },
      },
      project: {
        select: { id: true, title: true },
      },
      task_assignment: {
        select: {
          employee: {
            select: {
              id: true,
              profile: { select: { full_name: true } },
            },
          },
        },
      },
    };
  }

  private handleQueryResult(queryResult: unknown) {
    if (queryResult === null) {
      return { status: TASK_STATUS_MESSAGES.UNKNOWN, task: null };
    }

    const task = this.mapQueryResultToTaskData(queryResult);

    if (task === null) {
      console.error("Invalid query result format");
      return { status: TASK_STATUS_MESSAGES.UNKNOWN, task: null };
    }

    return { status: TASK_STATUS_MESSAGES.OK, task };
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
      title: rawTask.title,
      description: rawTask.description,
      startDate: rawTask.start_date.toISOString(),
      endDate: rawTask.end_date.toISOString(),
      completed: rawTask.completed,
      createdAt: rawTask.created_at.toISOString(),
      media: rawTask.task_media.map((media) => ({
        id: Number(media.id),
        type: media.type,
        url: media.url,
      })),
      boss: {
        id: rawTask.boss.id,
        fullName: rawTask.boss.profile.full_name,
      },
      project: {
        id: Number(rawTask.project.id),
        title: rawTask.project.title,
      },
      employees: rawTask.task_assignment.map((assignment) => ({
        id: assignment.employee.id,
        fullName: assignment.employee.profile.full_name,
      })),
    };
  }
}

const querySchema = z.object({
  id: z.bigint(),
  title: z.string(),
  description: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  completed: z.boolean(),
  created_at: z.date(),
  task_media: z.array(
    z.object({
      id: z.bigint(),
      type: z.enum(["image", "video"]),
      url: z.string(),
    }),
  ),
  boss: z.object({
    id: z.string(),
    profile: z.object({ full_name: z.string() }),
  }),
  project: z.object({ id: z.bigint(), title: z.string() }),
  task_assignment: z.array(
    z.object({
      employee: z.object({
        id: z.string(),
        profile: z.object({ full_name: z.string() }),
      }),
    }),
  ),
});
