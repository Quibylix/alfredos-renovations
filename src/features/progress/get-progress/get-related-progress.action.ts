"use server";

import { getUserRole } from "../../auth/protected-routes/get-user-role.util";
import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export type ProgressData = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  sent_date: string;
  parent_id: number | null;
  project: {
    id: number;
    title: string;
  };
  employee: {
    id: string;
    full_name: string;
  };
};

export async function getRelatedProgress(): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  progress: ProgressData[];
}> {
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  const role = await getUserRole(user?.id ?? null, db);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      progress: [],
    };
  }

  if (role === "employee") {
    const { data, error } = await db
      .from("progress")
      .select(
        `id, title, description, image_url, sent_date, parent_id,
        employee (id, profile (full_name)),
        project (id, title)`,
      )
      .eq("employee_id", user!.id)
      .is("parent_id", null);

    if (error) {
      console.error("Error fetching projects:", error);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        progress: [],
      };
    }

    const progress = data.map((progress) => {
      const { project, employee } = progress;
      return {
        id: progress.id,
        title: progress.title,
        description: progress.description,
        image_url: progress.image_url,
        sent_date: progress.sent_date,
        parent_id: progress.parent_id,
        project: {
          id: project.id,
          title: project.title,
        },
        employee: {
          id: employee.id,
          full_name: employee.profile.full_name,
        },
      };
    });

    return {
      errorCode: ERROR_CODES.SUCCESS,
      progress,
    };
  }

  const { data, error } = await db
    .from("progress")
    .select(
      `id, title, description, image_url, sent_date, parent_id,
        employee (id, profile (full_name)),
        project (id, title, boss_id)`,
    )
    .eq("project.boss_id", user!.id)
    .is("parent_id", null);

  if (error) {
    console.error("Error fetching projects:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      progress: [],
    };
  }

  const progress = data.map((progress) => {
    const { project, employee } = progress;
    return {
      id: progress.id,
      title: progress.title,
      description: progress.description,
      image_url: progress.image_url,
      sent_date: progress.sent_date,
      parent_id: progress.parent_id,
      project: {
        id: project.id,
        title: project.title,
      },
      employee: {
        id: employee.id,
        full_name: employee.profile.full_name,
      },
    };
  });

  return {
    errorCode: ERROR_CODES.SUCCESS,
    progress,
  };
}
