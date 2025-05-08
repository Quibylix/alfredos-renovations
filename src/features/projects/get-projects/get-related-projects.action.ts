"use server";

import { User } from "@/features/db/user/user.model";
import { createClient } from "../../db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export async function getRelatedProjects() {
  const db = await createClient();

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
      .from("employee")
      .select(`projects: project (id, title)`)
      .eq("id", userId!)
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
    .eq("boss_id", userId!);

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
