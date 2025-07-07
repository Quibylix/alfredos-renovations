"use server";

import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";
import { USER_ROLES } from "@/features/db/user/user.constant";
import { User } from "@/features/db/user/user.model";

export async function projectProgressEmployeeValidator(taskId: number) {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const userRole = await User.getRole(userId);

  if (userRole === USER_ROLES.ANON) {
    return false;
  }

  if (userRole === USER_ROLES.EMPLOYEE) {
    const response = await db
      .from("task_assignment")
      .select("task_id")
      .eq("task_id", taskId)
      .eq("employee_id", userId!)
      .single();

    if (response.error || !response.data) {
      return false;
    }
  }

  return true;
}
