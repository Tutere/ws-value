import { z } from "zod";

export const CreateActivitySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  projectId: z.string(),
});

export type CreateActivitySchema = z.infer<typeof CreateActivitySchema>;