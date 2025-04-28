"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";

export async function projectProgressEmployeeValidator(
  projectId: number,
  parentId: number,
) {
  const db = await createClient();

  const user = await db.auth.getUser();
  const userId = user.data.user?.id;

  if (!userId) {
    return false;
  }

  const { data: progressData, error: errorProgressData } = await db
    .from("progress")
    .select("id, employee(id), project(id)")
    .eq("id", parentId)
    .eq("employee.id", userId)
    .single();

  if (errorProgressData || !progressData) {
    return false;
  }

  if (progressData.project.id !== projectId) {
    return false;
  }

  return true;
}
