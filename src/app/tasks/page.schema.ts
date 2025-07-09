import { z } from "zod";

export const searchParamsSchema = z.object({
  title: z.string().optional(),
  completed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  start_date_lte: z.string().datetime().optional(),
  start_date_gte: z.string().datetime().optional(),
  end_date_lte: z.string().datetime().optional(),
  end_date_gte: z.string().datetime().optional(),
  employees: z.string().optional(),
  project: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 ? num : undefined;
    }),
  page: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 ? num : 1;
    }),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});
