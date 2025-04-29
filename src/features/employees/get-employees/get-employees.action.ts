"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { getUserRole } from "@/features/auth/protected-routes/get-user-role.util";

export async function getEmployees() {
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      employees: [],
    };
  }

  const userRole = await getUserRole(user?.id ?? null, db);

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
