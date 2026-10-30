import { z } from "zod";

export const semanticSearchSchema = z.object({
  query: z.string().trim().min(2).max(300),
});
