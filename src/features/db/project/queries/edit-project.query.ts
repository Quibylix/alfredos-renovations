import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import {
  PROJECT_STATUS_MESSAGES,
  ProjectStatusMessage,
} from "../project.constant";

export class EditProject {
  private projectId: number;
  private newData: { title: string };

  constructor(projectId: number, newData: { title: string }) {
    this.projectId = projectId;
    this.newData = newData;
  }

  async execute(): Promise<ProjectStatusMessage> {
    const userRole = await User.getRole();

    if (userRole !== "boss") {
      return PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED;
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error updating project:", error);
      return null;
    });

    return this.handleQueryResult(queryResult);
  }

  private async executeQuery() {
    const whereCondition = { id: this.projectId };
    const selectedColumns = { id: true };

    return prisma.project.update({
      where: whereCondition,
      select: selectedColumns,
      data: this.newData,
    });
  }

  private handleQueryResult(queryData: unknown) {
    if (queryData === null) {
      return PROJECT_STATUS_MESSAGES.UNKNOWN;
    }

    const mappedData = this.mapQueryResultToProjectData(queryData);

    if (!mappedData) {
      return PROJECT_STATUS_MESSAGES.UNKNOWN;
    }

    return PROJECT_STATUS_MESSAGES.OK;
  }

  private mapQueryResultToProjectData(queryData: unknown) {
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
});
