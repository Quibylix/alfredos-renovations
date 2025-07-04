"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";

export async function editProject({
  id,
  title,
  removedEmployees,
  addedEmployees,
}: {
  id: number;
  title: string;
  removedEmployees: string[];
  addedEmployees: string[];
}) {
  const db = await createClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role !== "boss") {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const response = await db
    .from("project")
    .update({
      title,
    })
    .eq("id", id)
    .eq("boss_id", userId!)
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error updating project:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  for (const employeeId of removedEmployees) {
    const { error } = await db
      .from("project_employee")
      .delete()
      .eq("project_id", id)
      .eq("employee_id", employeeId);

    if (error) {
      console.error("Error deleting project_employee:", error);
      return ERROR_CODES.UNKNOWN;
    }
  }

  for (const employeeId of addedEmployees) {
    const { error } = await db.from("project_employee").insert({
      project_id: id,
      employee_id: employeeId,
    });

    if (error) {
      console.error("Error inserting project_employee:", error);
      return ERROR_CODES.UNKNOWN;
    }
  }

  return ERROR_CODES.SUCCESS;
}
