"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { User } from "@/features/db/user/user.model";

export type ProjectData = {
  id: number;
  title: string;
  progress: {
    id: number;
    title: string;
    description: string;
    sentDate: string;
    imageUrl: string | null;
    media: {
      id: number;
      type: "image" | "video";
      url: string;
    }[];
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

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

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
        `id, title,
          progress(
            id, title, description, sent_date, image_url,
            employee (id, profile(full_name)),
            progress_media (id, type, url)
          )`,
      )
      .eq("id", projectId)
      .is("progress.parent_id", null)
      .eq("progress.employee_id", userId!)
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
        title: item.title!,
        description: item.description!,
        sentDate: item.sent_date,
        imageUrl: item.image_url,
        employee: {
          id: item.employee.id,
          fullName: item.employee.profile.full_name,
        },
        media: item.progress_media as Array<{
          id: number;
          type: "image" | "video";
          url: string;
        }>,
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
      progress(
        id, title, description, sent_date, image_url,
        employee(id, profile(full_name)),
        progress_media(id, type, url)
      ),
      employee(id, ...profile(full_name))`,
    )
    .eq("id", projectId)
    .is("progress.parent_id", null)
    .eq("boss_id", userId!)
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
      title: item.title!,
      description: item.description!,
      sentDate: item.sent_date,
      imageUrl: item.image_url,
      employee: {
        id: item.employee.id,
        fullName: item.employee.profile.full_name,
      },
      media: item.progress_media.map((media) => ({
        id: media.id,
        type: media.type as "image" | "video",
        url: media.url,
      })),
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
