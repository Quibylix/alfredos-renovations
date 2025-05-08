"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { ProgressData } from "./get-related-progress.action";
import { User } from "@/features/db/user/user.model";

export async function getProgressTree(progressId: number): Promise<{
  errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  progress: ProgressData | null;
  progressChildren: ProgressData[];
}> {
  const db = await createClient();

  const userId = await User.getCurrentUserId();
  const role = await User.getRole(userId);

  if (role === "anon") {
    return {
      errorCode: ERROR_CODES.NOT_AUTHORIZED,
      progress: null,
      progressChildren: [],
    };
  }

  const { data: dbProgressData, error: errorProgressData } = await db
    .from("progress")
    .select(
      `id, title, description, sent_date, image_url, parent_id,
    employee(id, profile(full_name)),
    project(id, title)`,
    )
    .eq("id", progressId)
    .single();

  if (errorProgressData) {
    console.error("Error fetching progress data:", errorProgressData);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      progress: null,
      progressChildren: [],
    };
  }

  const { data: progressChildrenData, error: errorChildren } = await db
    .from("progress")
    .select(
      `id, title, description, sent_date, image_url, parent_id,
    employee(id, profile(full_name)),
    project(id, title)`,
    )
    .eq("parent_id", progressId);

  if (errorChildren) {
    console.error("Error fetching projects:", errorChildren);
    return {
      errorCode: ERROR_CODES.UNKNOWN,
      progress: null,
      progressChildren: [],
    };
  }

  function mapProgressData(item: typeof dbProgressData): ProgressData | null {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      sent_date: item.sent_date,
      image_url: item.image_url,
      parent_id: item.parent_id,
      project: {
        id: item.project.id,
        title: item.project.title,
      },
      employee: {
        id: item.employee.id,
        full_name: item.employee.profile.full_name,
      },
    };
  }

  return {
    errorCode: ERROR_CODES.SUCCESS,
    progress: mapProgressData(dbProgressData),
    progressChildren: progressChildrenData.map(
      mapProgressData,
    ) as ProgressData[],
  };
}
