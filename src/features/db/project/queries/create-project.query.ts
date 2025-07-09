import { z } from "zod";
import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import {
  PROJECT_STATUS_MESSAGES,
  ProjectStatusMessage,
} from "../project.constant";

export class CreateProject {
  private data: { title: string };

  constructor(data: { title: string }) {
    this.data = data;
  }

  async execute(): Promise<ProjectStatusMessage> {
    const userRole = await User.getRole();

    if (userRole !== "boss") {
      return PROJECT_STATUS_MESSAGES.NOT_AUTHORIZED;
    }

    const queryResult = await this.executeQuery().catch((error) => {
      console.error("Error inserting project:", error);
      return null;
    });

    return this.handleQueryResult(queryResult);
  }

  private async executeQuery() {
    const selectedColumns = { id: true };

    return prisma.project.create({
      select: selectedColumns,
      data: this.data,
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
