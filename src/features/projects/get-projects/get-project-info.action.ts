"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { USER_ROLES } from "@/features/db/user/user.constant";

export type ProjectData = {
  id: number;
  title: string;
  tasks: {
    id: number;
    title: string;
    description: string;
    startDate: string;
    duration: number;
    completed: boolean;
    createdAt: string;
    media: {
      id: number;
      type: "image" | "video";
      url: string;
    }[];
  }[];
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

  const builtQuery = db
    .from("project")
    .select(
      `id, title,
          tasks: task(
            id, title, description, start_date, duration,
            completed, created_at,
            employees: employee (id, ...profile(full_name)),
            task_media (id, type, url)
          )`,
    )
    .eq("id", projectId);

  const { data, error } =
    role === USER_ROLES.EMPLOYEE
      ? await builtQuery.eq("tasks.employees.id", userId!).single()
      : await builtQuery.single();

  if (error) {
    console.error("Error fetching project:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      project: null,
    };
  }

  const projectData: ProjectData = {
    id: data.id,
    title: data.title,
    tasks: data.tasks.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startDate: item.start_date,
      duration: item.duration,
      completed: item.completed,
      createdAt: item.created_at,
      employees: item.employees.map((emp) => ({
        id: emp.id,
        fullName: emp.full_name,
      })),
      media: item.task_media as Array<{
        id: number;
        type: "image" | "video";
        url: string;
      }>,
    })),
  };

  return {
    errorCode: ERROR_CODES.SUCCESS,
    project: projectData,
  };
}
