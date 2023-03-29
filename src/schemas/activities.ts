import { z } from "zod";

export const CreateActivitySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  projectId: z.string().cuid(),
  engagementPattern: z.string(),
  valueCreated: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val).toISOString()),
  endDate: z.string().transform((val) => new Date(val).toISOString()),
});

export type CreateActivitySchema = z.infer<typeof CreateActivitySchema>;

export const ReadActivitySchema = z.object({
    projectId: z.string().cuid(),
  });