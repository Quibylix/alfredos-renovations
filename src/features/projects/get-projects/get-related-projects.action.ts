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
    // TODO - Implement a stored procedure to fetch employee projects using tasks
    // const { data, error } = await db
    //   .from("employee")
    //   .select(`projects: project (id, title)`)
    //   .eq("id", userId!)
    //   .single();
    const { data, error } = {
      data: { projects: [] },
      error: null,
    };

    if (error) {
      console.error("Error fetching projects:", error);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        projects: [],
      };
    }

    return {
      errorCode: ERROR_CODES.SUCCESS,
      projects: data?.projects ?? [],
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
