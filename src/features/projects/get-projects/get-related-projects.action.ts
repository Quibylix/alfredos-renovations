"use server";

import { User } from "@/features/db/user/user.model";
import { ERROR_CODES } from "./error_codes.constant";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";

export async function getRelatedProjects() {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      projects: [],
    };
  }

  if (role === "employee") {
    const { data, error } = await db
      .from("project")
      .select("id, title, task!inner(task_assignment!inner(employee_id))")
      .eq("task.task_assignment.employee_id", userId!);

    if (error) {
      console.error("Error fetching projects:", error);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        projects: [],
      };
    }

    return {
      errorCode: ERROR_CODES.SUCCESS,
      projects: data.map((project) => ({
        id: project.id,
        title: project.title,
      })),
    };
  }

  const { data: projects, error } = await db
    .from("project")
    .select("id, title");

  if (error) {
    console.error("Error fetching projects:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      projects: [],
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    projects: projects ?? [],
  };
}
