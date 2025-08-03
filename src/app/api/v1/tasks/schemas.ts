import { z } from "zod";
import { ERROR_CODES } from "@/features/tasks/set-task/error_codes.constant";

export const setTaskApiResponseSchema = z.object({
  success: z.boolean(),
  errorCode: z.nativeEnum(ERROR_CODES),
  message: z.string(),
});
