"use server";

import { getUserRole } from "../../auth/protected-routes/get-user-role.util";
import { createClient } from "../../db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export async function getRelatedProjects() {
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  const role = await getUserRole(user?.id ?? null, db);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      projects: [],
    };
  }

  if (role === "employee") {
    const { data, error } = await db
      .from("employee")
      .select(`projects: project (id, title)`)
      .eq("id", user!.id)
      .single();

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
    .select("id, title")
    .eq("boss_id", user!.id);

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
