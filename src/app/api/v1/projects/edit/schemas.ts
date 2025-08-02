import { z } from "zod";
import { STATUS_MESSAGES } from "@/features/shared/app-errors/status-messages.constant";

export const editProjectApiResponseSchema = z.object({
  success: z.boolean(),
  status: z.nativeEnum(STATUS_MESSAGES),
  message: z.string(),
});

export const editProjectApiBodySchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().nonempty(),
});
