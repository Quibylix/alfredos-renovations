import { z } from "zod";
import { STATUS_MESSAGES } from "@/features/shared/app-errors/status-messages.constant";

export const createProjectApiResponseSchema = z.object({
  success: z.boolean(),
  status: z.nativeEnum(STATUS_MESSAGES),
  message: z.string(),
});

export const createProjectApiBodySchema = z.object({
  title: z.string().trim().nonempty(),
});
