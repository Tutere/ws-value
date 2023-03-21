import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;
