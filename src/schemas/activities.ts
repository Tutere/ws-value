import { z } from "zod";

export const CreateActivitySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string(),
  projectId: z.string().cuid(),
  engagementPattern: z.string(),
  valueCreated: z.string().optional(),
  startDate: z.string().transform((val) => new Date(val).toISOString()),
  endDate: z.string().transform((val) => new Date(val).toISOString()),
  id: z.string(), //for data lineage
  changeType: z.string(), //for data lineage
  status: z.string(),
  outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
});

export type CreateActivitySchema = z.infer<typeof CreateActivitySchema>;

export const ReadActivitySchema = z.object({
    projectId: z.string().cuid(),
  });

  export const ReadSpecificActivitySchema = z.object({
    id: z.string().cuid(),
  });

  export const EditActivitySchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1).max(255),
    description: z.string(),
    projectId: z.string().cuid(),
    engagementPattern: z.string(),
    valueCreated: z.string().optional(),
    startDate: z.string().transform((val) => new Date(val).toISOString()),
    endDate: z.string().transform((val) => new Date(val).toISOString()),
    changeType: z.string(),
    outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
    effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  });