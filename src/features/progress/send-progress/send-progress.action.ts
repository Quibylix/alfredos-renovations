"use server";

import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ERROR_CODES } from "./error_codes.constant";

export async function sendProgress({
  projectId,
  title,
  description,
  media,
}: {
  projectId: number;
  title: string;
  description: string;
  media: { type: "image" | "video"; url: string }[];
}) {
  const db = await createClient();

  const userResult = await db.auth.getUser();

  if (!userResult.data.user) {
    return ERROR_CODES.INVALID_REQUEST;
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
