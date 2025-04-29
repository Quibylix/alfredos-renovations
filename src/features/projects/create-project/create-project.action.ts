"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { getUserRole } from "@/features/auth/protected-routes/get-user-role.util";

export async function createProject({
  title,
  employees,
}: {
  title: string;
  employees: string[];
}) {
  const db = await createClient();

  const userResult = await db.auth.getUser();

  if (!userResult.data.user) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const role = await getUserRole(userResult.data.user.id, db);

  if (role !== "boss") {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const response = await db
    .from("project")
    .insert({
      title,
      boss_id: userResult.data.user.id,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting project:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  const { error } = await db.from("project_employee").insert(
    employees.map((employee) => ({
      project_id: response.data.id,
      employee_id: employee,
    })),
  );

  if (error) {
    console.error("Error inserting project_employee:", error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
