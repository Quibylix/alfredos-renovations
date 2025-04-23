"use server";

import { createClient } from "../db/supabase/create-server-client.util";

export async function checkEmployeeIsInProject(projectId: number) {
  const db = await createClient();

  const response = await db.auth.getUser();

  if (response.error) {
    return false;
  }

  const { data, error } = await db
    .from("project_employee")
    .select("*")
    .eq("project_id", projectId)
    .eq("employee_id", response.data.user.id)
    .single();

  if (!data || error) {
    return false;
  }

  return true;
}
