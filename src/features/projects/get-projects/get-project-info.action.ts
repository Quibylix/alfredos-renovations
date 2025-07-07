"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { USER_ROLES } from "@/features/db/user/user.constant";
import { TaskData } from "@/features/tasks/get-tasks/get-related-tasks.action";

export type ProjectData = {
  id: number;
  title: string;
  tasks: TaskData[];
};

export async function getProjectInfo(projectId: number): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  project: ProjectData | null;
}> {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      project: null,
    };
  }

  if (role === USER_ROLES.EMPLOYEE) {
    const { data: validationData, error: validationError } = await db
      .from("task_assignment")
      .select("...task!inner(id, project(id, title))")
      .eq("employee_id", userId!)
      .eq("task.project_id", projectId);

    if (!validationData || validationData.length === 0) {
      return {
        errorCode: ERROR_CODES.NOT_AUTHORIZED,
        project: null,
      };
    }

    if (validationError) {
      console.error("Error fetching task assignment:", validationError);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        project: null,
      };
    }

    const tasksIds = validationData.map((item) => item.id);

    const { data: tasksData, error: tasksError } = await db
      .from("task")
      .select(
        `id, title, description, startDate: start_date, duration, completed, createdAt: created_at,
          employees: employee(id, ...profile(fullName: full_name)),
          media:task_media(id, type, url),
          boss(id, ...profile(fullName: full_name)),
          project(id, title)`,
      )
      .eq("project_id", projectId)
      .in("id", tasksIds);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        project: null,
      };
    }

    return {
      errorCode: ERROR_CODES.SUCCESS,
      project: {
        id: projectId,
        title: validationData[0].project.title,
        tasks: tasksData as TaskData[],
      },
    };
  }

  const { data, error } = await db
    .from("project")
    .select(
      `id, title,
          tasks: task(
            id, title, description, startDate: start_date, duration,
            completed, createdAt: created_at,
            employees: employee(id, ...profile(fullName: full_name)),
            media:task_media (id, type, url),
            boss(id, ...profile(fullName: full_name)),
            project(id, title)
          )`,
    )
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      project: null,
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    project: data as ProjectData,
  };
}
