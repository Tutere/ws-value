import { z } from "zod";

export const CreateProjectSchema = z.object({
  icon: z.string().optional(),
  colour: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
  estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
  estimatedEnd: z
    .string()
    .transform((val) => new Date(val).toISOString())
    .optional(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(),
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
  status: z.string(),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;

export const CompleteProjectSchema = z.object({
  outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  status: z.string(),
  actualStart: z.string().transform((val) => new Date(val).toISOString()),
  actualEnd: z.string().transform((val) => new Date(val).toISOString()),
  lessonsLearnt: z.string().optional(),
  retrospective: z.string().optional(),
  id: z.string().cuid(),
});

export const EditProjectSchema = z.object({
  icon: z.string().optional(),
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
  estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
  estimatedEnd: z
    .string()
    .transform((val) => new Date(val).toISOString())
    .optional(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(),
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
});

export const DeleteProjectSchema = z.object({
  id: z.string().cuid(),
});

export const FindProjectByActivityIdSchema = z.object({
  id: z.string().cuid(),
});
