import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { USER_ROLES } from "../../user/user.constant";
import { TASK_STATUS_MESSAGES, TaskStatusMessage } from "../task.constant";
import { GetRelatedTasksFilters } from "./get-related-tasks.query";

export class GetRelatedTasksCount {
  private userId: string | null = null;
  private userRole: string | null = null;

  private filters: GetRelatedTasksFilters = {};

  async execute(): Promise<{
    status: TaskStatusMessage;
    count: number;
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return { status: TASK_STATUS_MESSAGES.NOT_AUTHORIZED, count: 0 };
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error fetching tasks:", error);
      return null;
    });

    if (queryResult === null) {
      return { status: TASK_STATUS_MESSAGES.UNKNOWN, count: 0 };
    }

    return {
      status: TASK_STATUS_MESSAGES.OK,
      count: queryResult,
    };
  }

  withFilters(filters: GetRelatedTasksFilters) {
    this.filters = { ...this.filters, ...filters };
    return this;
  }

  private async getUserInfo() {
    this.userId = await User.getCurrentUserId();
    this.userRole = await User.getRole(this.userId);
  }

  private async executeQuery() {
    const whereCondition = this.getWhereCondition();

    return prisma.task.count({
      where: whereCondition,
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
}
