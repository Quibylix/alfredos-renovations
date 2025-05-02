"use server";

import { getUserRole } from "../../auth/protected-routes/get-user-role.util";
import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export type ProjectData = {
  id: number;
  title: string;
  progress: {
    id: number;
    title: string;
    description: string;
    sentDate: string;
    imageUrl: string | null;
    employee: {
      id: string;
      fullName: string;
    };
  }[];
  employees:
    | {
        id: string;
        fullName: string;
      }[]
    | null;
};

export async function getProjectInfo(projectId: number): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  project: ProjectData | null;
}> {
  const db = await createClient();

  const {
    data: { user },
  } = await db.auth.getUser();

  const role = await getUserRole(user?.id ?? null, db);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      project: null,
    };
  }

  if (role === "employee") {
    const { data, error } = await db
      .from("project")
      .select(
        "id, title, progress(id, title, description, sent_date, image_url, employee (id, profile(full_name)))",
      )
      .eq("id", projectId)
      .is("progress.parent_id", null)
      .eq("progress.employee_id", user!.id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return {
        errorCode: ERROR_CODES.UNKNOWN,
        project: null,
      };
    }

    const projectData: ProjectData = {
      id: data.id,
      title: data.title,
      progress: data.progress.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        sentDate: item.sent_date,
        imageUrl: item.image_url,
        employee: {
          id: item.employee.id,
          fullName: item.employee.profile.full_name,
        },
      })),
      employees: null,
    };

    return {
      errorCode: ERROR_CODES.SUCCESS,
      project: projectData,
    };
  }

  const { data, error } = await db
    .from("project")
    .select(
      `id, title,
      progress(id, title, description, sent_date, image_url, employee(id, profile(full_name))),
      employee(id, ...profile(full_name))`,
    )
    .eq("id", projectId)
    .is("progress.parent_id", null)
    .eq("boss_id", user!.id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      project: null,
    };
  }

  const projectData: ProjectData = {
    id: data.id,
    title: data.title,
    progress: data.progress.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      sentDate: item.sent_date,
      imageUrl: item.image_url,
      employee: {
        id: item.employee.id,
        fullName: item.employee.profile.full_name,
      },
    })),
    employees: data.employee.map((employee) => ({
      id: employee.id,
      fullName: employee.full_name,
    })),
  };

  return {
    errorCode: ERROR_CODES.SUCCESS,
    project: projectData,
  };
}
