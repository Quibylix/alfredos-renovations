import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../user/user.constant";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";
import { TaskData } from "../../task/task.types";

export type GetRelatedTasksFilters = {
  title?: string;
  startDate?: {
    gte?: Date;
    lte?: Date;
  };
  endDate?: {
    gte?: Date;
    lte?: Date;
  };
  completed?: boolean;
  employeeIds?: string[];
  projectId?: number;
};

export class GetRelatedTasks {
  private userId: string | null = null;
  private userRole: string | null = null;

  private filters: GetRelatedTasksFilters;

  constructor(filters: GetRelatedTasksFilters = {}) {
    this.filters = filters;
  }

  async execute(): Promise<{
    status: TaskStatusMessage;
    tasks: TaskData[];
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return { status: TASK_STATUS_MESSAGES.NOT_AUTHORIZED, tasks: [] };
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

    return prisma.task.findMany({
      where: whereCondition,
      select: selectedColumns,
    });
  }

  private getWhereCondition() {
    const filters = this.applyFiltersToWhereCondition();

    if (this.userRole === USER_ROLES.BOSS) {
      return { AND: [filters] };
    }

    return {
      AND: [
        filters,
        {
          task_assignment: {
            some: { employee_id: this.userId! },
          },
        },
      ],
    };
  }

  private applyFiltersToWhereCondition() {
    return {
      ...(this.filters.title
        ? {
            title: {
              contains: this.filters.title,
              mode: "insensitive" as const,
            },
          }
        : {}),
      completed: this.filters.completed,
      start_date: {
        gte: this.filters.startDate?.gte,
        lte: this.filters.startDate?.lte,
      },
      end_date: {
        gte: this.filters.endDate?.gte,
        lte: this.filters.endDate?.lte,
      },
      project_id: this.filters.projectId,
      ...(this.filters.employeeIds && this.filters.employeeIds.length > 0
        ? {
            task_assignment: {
              some: {
                employee_id: {
                  in: this.filters.employeeIds,
                },
              },
            },
          }
        : {}),
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
      return { status: TASK_STATUS_MESSAGES.UNKNOWN, tasks: [] };
    }

    const tasks = this.mapQueryResultToTaskData(queryResult);

    if (tasks === null) {
      console.error("Invalid query result format");
      return { status: TASK_STATUS_MESSAGES.UNKNOWN, tasks: [] };
    }

    return { status: TASK_STATUS_MESSAGES.OK, tasks };
  }

  private mapQueryResultToTaskData(queryResult: unknown) {
    const result = querySchema.safeParse(queryResult);

    if (!result.success) {
      console.error("Invalid query result:", result.error);
      return null;
    }

    const rawTasks = result.data;

    return rawTasks.map((task) => ({
      id: Number(task.id),
      title: task.title,
      description: task.description,
      startDate: task.start_date.toISOString(),
      endDate: task.end_date.toISOString(),
      completed: task.completed,
      createdAt: task.created_at.toISOString(),
      media: task.task_media.map((media) => ({
        id: Number(media.id),
        type: media.type,
        url: media.url,
      })),
      boss: {
        id: task.boss.id,
        fullName: task.boss.profile.full_name,
      },
      project: {
        id: Number(task.project.id),
        title: task.project.title,
      },
      employees: task.task_assignment.map((assignment) => ({
        id: assignment.employee.id,
        fullName: assignment.employee.profile.full_name,
      })),
    }));
  }
}

const querySchema = z.array(
  z.object({
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
  }),
);
