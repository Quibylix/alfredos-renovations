import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { UnauthorizedError } from "@/features/shared/app-errors/unauthorized.error";

export class EditProject {
  private projectId: number;
  private newData: { title: string };

  constructor(projectId: number, newData: { title: string }) {
    this.projectId = projectId;
    this.newData = newData;
  }

  async execute() {
    const userRole = await User.getRole();

    if (userRole !== "boss") {
      throw new UnauthorizedError();
    }

    return await this.executeQuery();
  }

  private async executeQuery() {
    const whereCondition = { id: this.projectId };

    return prisma.project.update({
      where: whereCondition,
      data: this.newData,
    });
  }
}
