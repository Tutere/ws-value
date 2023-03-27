import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
  estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
  estimatedEnd: z.string().transform((val) => new Date(val).toISOString()).optional(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(), 
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
  outcomeScore: z.number().int().optional(),
  effortScore: z.number().int().optional(),
  status: z.string(),
  actualStart: z.string().transform((val) => new Date(val).toISOString()),
  actualEnd: z.string().transform((val) => new Date(val).toISOString()),
  lessonsLearnt: z.string().optional(),
  retrospecive: z.string().optional(),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;

export const CompleteProjectSchema = z.object({
  outcomeScore: z.preprocess((val) => Number(val), z.number()),
  effortScore: z.preprocess((val) => Number(val), z.number()),
  status: z.string(),
  actualStart: z.string().transform((val) => new Date(val).toISOString()),
  actualEnd: z.string().transform((val) => new Date(val).toISOString()),
  lessonsLearnt: z.string().optional(),
  retrospective: z.string().optional(),
  id: z.string().cuid(),
});
