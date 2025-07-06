"use server";

import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";
import { createAdminClient } from "@/features/db/supabase/create-admin-client.util";

export async function getEmployees() {
  const db = createAdminClient();

  const userId = await User.getCurrentUserId();
  const userRole = await User.getRole(userId);

  if (userRole !== "boss") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      employees: [],
    };
  }

  const { data, error } = await db
    .from("employee")
    .select("id, ...profile(full_name)");

  if (error || !data) {
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      employees: [],
    };
  }

  const employees = data.map((employee) => ({
    id: employee.id,
    fullName: employee.full_name,
  }));

  return {
    errorCode: ERROR_CODES.SUCCESS,
    employees,
  };
}
