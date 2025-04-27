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
        `id, title, description, image_url, sent_date,
        employee (id, profile (full_name)),
        project (id, title)`,
      )
      .eq("employee_id", user!.id);

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
    .from("project")
    .select(
      `id, title,
      project_employee!project_id (
        employee (
          id, 
          profile (full_name),
          progress (
            id, title, description, image_url, sent_date
          )
        )
      )
      `,
    )
    .eq("boss_id", user!.id);

  if (error) {
    console.error("Error fetching projects:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      progress: [],
    };
  }

  const progress: ProgressData[] = [];
  data.forEach((project) => {
    project.project_employee.forEach(({ employee }) => {
      employee.progress.forEach((progressItem) => {
        const progressData = {
          id: progressItem.id,
          title: progressItem.title,
          description: progressItem.description,
          image_url: progressItem.image_url,
          sent_date: progressItem.sent_date,
          project: {
            id: project.id,
            title: project.title,
          },
          employee: {
            id: employee.id,
            full_name: employee.profile.full_name,
          },
        };

        progress.push(progressData);
      });
    });
  });

  return {
    errorCode: ERROR_CODES.SUCCESS,
    progress,
  };
}
