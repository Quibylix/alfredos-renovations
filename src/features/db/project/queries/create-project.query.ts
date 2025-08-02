import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { UnauthorizedError } from "@/features/shared/app-errors/unauthorized.error";
import { USER_ROLES } from "../../user/user.constant";
import { DatabaseError } from "@/features/shared/app-errors/database.error";

export class CreateProject {
  private data: { title: string };

  constructor(data: { title: string }) {
    this.data = data;
  }

  async execute() {
    const userRole = await User.getRole();

    if (userRole !== USER_ROLES.BOSS) {
      throw new UnauthorizedError();
    }

    await this.executeQuery().catch((error) => {
      console.error("Error inserting project:", error);
      throw new DatabaseError();
    });
  }

  private executeQuery() {
    const selectedColumns = { id: true };

    return prisma.project.create({
      select: selectedColumns,
      data: this.data,
    });
  }
}
