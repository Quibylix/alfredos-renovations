"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { USER_ROLES } from "@/features/db/user/user.constant";
import { TaskData } from "@/features/tasks/get-tasks/get-related-tasks.action";
import { prisma } from "@/features/db/prisma/db";

export type ProjectData = {
  id: number;
  title: string;
  tasks: TaskData[];
};

export async function getProjectInfo(projectId: number): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  project: ProjectData | null;
}> {
  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      project: null,
    };
  }

  const whereCondition =
    role === USER_ROLES.EMPLOYEE
      ? {
          id: projectId,
          task: {
            some: { task_assignment: { some: { employee_id: userId! } } },
          },
        }
      : { id: projectId };

  const selectedColumns = {
    id: true,
    title: true,
    task: {
      ...(role === USER_ROLES.EMPLOYEE
        ? {
            where: {
              task_assignment: {
                some: { employee_id: userId! },
              },
            },
          }
        : {}),
      orderBy: {
        created_at: "asc" as const,
      },
      select: {
        id: true,
        title: true,
        description: true,
        start_date: true,
        duration: true,
        completed: true,
        created_at: true,
        task_assignment: {
          select: {
            employee: {
              select: {
                id: true,
                profile: {
                  select: { full_name: true },
                },
              },
            },
          },
        },
        task_media: {
          select: { id: true, type: true, url: true },
        },
        boss: {
          select: { id: true, profile: { select: { full_name: true } } },
        },
      },
    },
  };

  const projectData = await prisma.project
    .findUnique({
      where: whereCondition,
      select: selectedColumns,
    })
    .catch((error) => {
      console.error("Error fetching project:", error);
      return undefined;
    });

  if (projectData === undefined) {
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      project: null,
    };
  }

  if (!projectData) {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      project: null,
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    project: {
      id: Number(projectData.id),
      title: projectData.title,
      tasks: projectData.task.map((task) => ({
        id: Number(task.id),
        title: task.title,
        description: task.description,
        startDate: task.start_date.toISOString(),
        duration: Number(task.duration),
        completed: task.completed,
        createdAt: task.created_at.toISOString(),
        employees: task.task_assignment.map((assignment) => ({
          id: assignment.employee.id,
          fullName: assignment.employee.profile.full_name,
        })),
        media: task.task_media.map((media) => ({
          id: Number(media.id),
          type: media.type as "image" | "video",
          url: media.url,
        })),
        boss: {
          id: task.boss.id,
          fullName: task.boss.profile.full_name,
        },
        project: {
          id: Number(projectData.id),
          title: projectData.title,
        },
      })),
    },
  };
}
