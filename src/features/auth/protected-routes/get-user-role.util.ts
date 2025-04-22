import { createClient } from "@/features/db/supabase/create-server-client.util";

export async function getUserRole(
  userId: string | null,
  db: Awaited<ReturnType<typeof createClient>>,
) {
  if (!userId) {
    return "anon";
  }

  const isBoss = Boolean(
    (await db.from("boss").select("id").eq("id", userId).single()).data,
  );

  if (isBoss) {
    return "boss";
  }

  const isEmployee = Boolean(
    (await db.from("employee").select("id").eq("id", userId).single()).data,
  );

  if (isEmployee) {
    return "employee";
  }

  return "anon";
}
