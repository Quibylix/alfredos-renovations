import { User } from "../../user/user.model";
import {
  PROJECT_STATUS_MESSAGES,
  ProjectStatusMessage,
} from "../project.constant";
import { USER_ROLES, UserRole } from "../../user/user.constant";
import { prisma } from "../../prisma/db";
import { z } from "zod";

export class GetRelatedProjects {
  private userId: string | null = null;
  private userRole: UserRole | null = null;

  async execute(): Promise<{
    status: ProjectStatusMessage;
    projects: { id: number; title: string }[];
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return {
        status: PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED,
        projects: [],
      };
    }

    const queryResult = await this.executeQuery();

    return this.handleQueryResult(queryResult);
  }

  private async getUserInfo() {
    this.userId = await User.getCurrentUserId();
    this.userRole = await User.getRole(this.userId);
  }

  private async executeQuery() {
    const whereCondition = this.getWhereCondition();
    const selectedColumns = this.getSelectedColumns();

    return prisma.project.findMany({
      where: whereCondition,
      select: selectedColumns,
    });
  }

  private handleQueryResult(queryData: unknown) {
    if (queryData === undefined) {
      return {
        status: PROJECT_STATUS_MESSAGES.UNKNOWN,
        projects: [],
      };
    }

    if (queryData === null) {
      return {
        status: PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED,
        projects: [],
      };
    }

    return {
      status: PROJECT_STATUS_MESSAGES.OK,
      projects: this.mapQueryResultToProjectData(queryData),
    };
  }

  private mapQueryResultToProjectData(queryData: unknown) {
    const parsedData = querySchema.parse(queryData);

    return parsedData.map((project) => ({
      id: Number(project.id),
      title: project.title,
    }));
  }

  private getWhereCondition() {
    const employeeCondition = {
      task: {
        some: {
          task_assignment: {
            some: {
              employee_id: this.userId!,
            },
          },
        },
      },
    };

    return this.userRole === USER_ROLES.EMPLOYEE
      ? employeeCondition
      : undefined;
  }

  private getSelectedColumns() {
    return {
      id: true,
      title: true,
    };
  }
}

const querySchema = z.array(
  z.object({
    id: z.bigint(),
    title: z.string(),
  }),
);
