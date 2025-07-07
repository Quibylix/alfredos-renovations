"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { USER_ROLES } from "@/features/db/user/user.constant";

export type TaskData = {
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
  employees: {
    id: string;
    fullName: string;
  }[];
  boss: {
    id: string;
    fullName: string;
  };
  project: {
    id: number;
    title: string;
  };
};

export async function getRelatedTasks(): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  tasks: TaskData[];
}> {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      tasks: [],
    };
  }

  if (role === USER_ROLES.BOSS) {
    const { data, error } = await db.from("task").select(
      `id, title, description, startDate: start_date, duration,
        completed, createdAt: created_at,
        employees: employee(id, ...profile(fullName: full_name)),
        media: task_media (id, type, url),
        boss(id, ...profile(fullName: full_name)),
        project(id, title)`,
    );

    if (error || !data) {
      console.error("Error fetching projects:", error);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        tasks: [],
      };
    }

    return {
      errorCode: ERROR_CODES.SUCCESS,
      tasks: data as TaskData[],
    };
  }

  const { data, error } = await db
    .from("task_assignment")
    .select(
      `...task(id, title, description, startDate: start_date,
        duration, completed, createdAt: created_at,
        employees: employee(id, ...profile(fullName: full_name)),
        media: task_media (id, type, url),
        boss(id, ...profile(fullName: full_name)),
        project(id, title))`,
    )
    .eq("employee_id", userId!);

  if (error) {
    console.error("Error fetching task assignments:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      tasks: [],
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    tasks: data as TaskData[],
  };
}
