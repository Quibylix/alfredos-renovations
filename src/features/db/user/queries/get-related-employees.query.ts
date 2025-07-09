import { User } from "../../user/user.model";
import {
  USER_STATUS_MESSAGES,
  UserStatusMessage,
  USER_ROLES,
  UserRole,
} from "../user.constant";
import { prisma } from "../../prisma/db";
import { z } from "zod";

export class GetRelatedEmployees {
  private userId: string | null = null;
  private userRole: UserRole | null = null;

  async execute(): Promise<{
    status: UserStatusMessage;
    employees: { id: string; fullName: string }[];
  }> {
    await this.getUserInfo();

    if (this.userRole === USER_ROLES.ANON) {
      return {
        status: USER_STATUS_MESSAGES.NOT_AUTHORIZED,
        employees: [],
      };
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error executing query:", error);
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

    return prisma.employee.findMany({
      where: whereCondition,
      select: selectedColumns,
    });
  }

  private handleQueryResult(queryData: unknown) {
    if (queryData === null) {
      return {
        status: USER_STATUS_MESSAGES.UNKNOWN_ERROR,
        employees: [],
      };
    }

    const mappedData = this.mapQueryResultToProjectData(queryData);

    if (mappedData === null) {
      return {
        status: USER_STATUS_MESSAGES.UNKNOWN_ERROR,
        employees: [],
      };
    }

    return {
      status: USER_STATUS_MESSAGES.OK,
      employees: mappedData,
    };
  }

  private mapQueryResultToProjectData(queryData: unknown) {
    const result = querySchema.safeParse(queryData);

    if (!result.success) {
      console.error("Error parsing project data:", result.error);
      return null;
    }

    return result.data.map((project) => ({
      id: project.id,
      fullName: project.profile.full_name,
    }));
  }

  private getWhereCondition() {
    const employeeCondition = {
      NOT: {
        id: this.userId!,
      },
      task_assignment: {
        some: {
          task: {
            task_assignment: {
              some: {
                employee_id: this.userId!,
              },
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
      profile: {
        select: {
          full_name: true,
        },
      },
    };
  }
}

const querySchema = z.array(
  z.object({
    id: z.string(),
    profile: z.object({
      full_name: z.string(),
    }),
  }),
);
