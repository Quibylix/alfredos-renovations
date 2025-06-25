"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";
import { projectProgressEmployeeValidator } from "./project-progress-employee-validator.action";

export async function extendProgress({
  projectId,
  parentId,
  title,
  description,
  media,
}: {
  projectId: number;
  parentId: number;
  title: string;
  description: string;
  media: { type: "image" | "video"; url: string }[];
}) {
  if (!projectProgressEmployeeValidator(projectId, parentId)) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const db = await createClient();

  const userResult = await db.auth.getUser();

  if (!userResult.data.user) {
    return ERROR_CODES.NOT_AUTHORIZED;
  }

  const imageUrl = media.find((m) => m.type === "image")?.url || null;

  const response = await db
    .from("progress")
    .insert({
      title,
      description,
      image_url: imageUrl,
      employee_id: userResult.data.user.id,
      project_id: projectId,
      parent_id: parentId,
    })
    .select("id")
    .single();

  if (!response.data || response.error) {
    console.error("Error inserting progress:", response.error);
    return ERROR_CODES.UNKNOWN;
  }

  const progressId = response.data.id;

  const mediaInsertions = media.map((m) => ({
    progress_id: progressId,
    type: m.type,
    url: m.url,
  }));

  const mediaResponse = await db.from("progress_media").insert(mediaInsertions);

  if (mediaResponse.error) {
    console.error("Error inserting progress media:", mediaResponse.error);
    return ERROR_CODES.UNKNOWN;
  }

  return ERROR_CODES.SUCCESS;
}
