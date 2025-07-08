"use server";

import { User } from "@/features/db/user/user.model";
import { ERROR_CODES } from "./error_codes.constant";
import { prisma } from "@/features/db/prisma/db";

export async function getRelatedProjects() {
  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      projects: [],
    };
  }

  const whereCondition =
    role === "employee"
      ? {
          task: {
            some: {
              task_assignment: {
                some: {
                  employee_id: userId!,
                },
              },
            },
          },
        }
      : undefined;

  const projects = await prisma.project
    .findMany({
      select: {
        id: true,
        title: true,
      },
      where: whereCondition,
    })
    .catch((error) => {
      console.error("Error fetching projects:", error);
      return null;
    });

  if (projects === null) {
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      projects: [],
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    projects,
  };
}
