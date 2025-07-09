import { User } from "../../user/user.model";
import {
  PROJECT_STATUS_MESSAGES,
  ProjectStatusMessage,
} from "../project.constant";
import { USER_ROLES, UserRole } from "../../user/user.constant";
import { prisma } from "../../prisma/db";
import { z } from "zod";
import { ProjectData } from "../project.types";

export class GetProjectInfo {
  private userId: string | null = null;
  private userRole: UserRole | null = null;
  private projectId: number;

  constructor(projectId: number) {
    this.projectId = projectId;
  }

  async execute(): Promise<{
    status: ProjectStatusMessage;
    project: ProjectData | null;
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return {
        status: PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED,
        project: null,
      };
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error executing project query:", error);
      return undefined;
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

    return prisma.project.findUnique({
      where: whereCondition,
      select: selectedColumns,
    });
  }

  private handleQueryResult(queryData: unknown) {
    if (queryData === undefined) {
      return {
        status: PROJECT_STATUS_MESSAGES.UNKNOWN,
        project: null,
      };
    }

    if (queryData === null) {
      return {
        status: PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED,
        project: null,
      };
    }

    return {
      status: PROJECT_STATUS_MESSAGES.OK,
      project: this.mapQueryResultToProjectData(queryData),
    };
  }

  private mapQueryResultToProjectData(queryData: unknown) {
    const parsedData = querySchema.parse(queryData);

    return {
      id: Number(parsedData.id),
      title: parsedData.title,
      tasks: parsedData.task.map((task) => ({
        id: Number(task.id),
        title: task.title,
        description: task.description,
        startDate: task.start_date.toISOString(),
        endDate: task.end_date.toISOString(),
        completed: task.completed,
        createdAt: task.created_at.toISOString(),
        employees: task.task_assignment.map((assignment) => ({
          id: assignment.employee.id,
          fullName: assignment.employee.profile.full_name,
        })),
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
          id: Number(parsedData.id),
          title: parsedData.title,
        },
      })),
    };
  }

  private getWhereCondition() {
    const employeeCondition = {
      id: this.projectId,
      AND: {
        task: {
          some: {
            task_assignment: {
              some: { employee_id: this.userId! },
            },
          },
        },
      },
    };

    return this.userRole === USER_ROLES.EMPLOYEE
      ? employeeCondition
      : { id: this.projectId };
  }

  private getSelectedColumns() {
    const commonColumns = {
      id: true,
      title: true,
    };

    const taskAssignmentSelector = {
      employee: {
        select: {
          id: true,
          profile: {
            select: { full_name: true },
          },
        },
      },
    };

    const taskCommonColumns = {
      id: true,
      title: true,
      description: true,
      start_date: true,
      end_date: true,
      completed: true,
      created_at: true,
      task_assignment: {
        select: taskAssignmentSelector,
      },
      task_media: {
        select: { id: true, type: true, url: true },
      },
      boss: {
        select: { id: true, profile: { select: { full_name: true } } },
      },
    };

    const taskFilter =
      this.userRole === USER_ROLES.EMPLOYEE
        ? {
            where: {
              task_assignment: {
                some: { employee_id: this.userId! },
              },
            },
          }
        : {};

    return {
      ...commonColumns,
      task: {
        ...taskFilter,
        orderBy: {
          created_at: "asc",
        } as const,
        select: taskCommonColumns,
      },
    };
  }
}

const querySchema = z.object({
  id: z.bigint(),
  title: z.string(),
  task: z.array(
    z.object({
      id: z.bigint(),
      title: z.string(),
      description: z.string(),
      start_date: z.date(),
      end_date: z.date(),
      completed: z.boolean(),
      created_at: z.date(),
      task_assignment: z.array(
        z.object({
          employee: z.object({
            id: z.string(),
            profile: z.object({
              full_name: z.string(),
            }),
          }),
        }),
      ),
      task_media: z.array(
        z.object({
          id: z.bigint(),
          type: z.enum(["image", "video"]),
          url: z.string(),
        }),
      ),
      boss: z.object({
        id: z.string(),
        profile: z.object({
          full_name: z.string(),
        }),
      }),
    }),
  ),
});
