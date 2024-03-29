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
    .transform((val) => val? new Date(val).toISOString(): null)
    .nullable(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(),
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
  status: z.string(),
  projectId: z.string(),
  changeType: z.string(),
  members: z.array(z.string()),
  stakeholders: z.string().optional(),
  pid: z.string().optional(),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;

export const CompleteProjectSchema = z.object({
  outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  status: z.string(),
  actualStart: z.string().transform((val) => new Date(val).toISOString()),
  actualEnd: z
  .string()
  .transform((val) => val? new Date(val).toISOString(): null)
  .nullable(),
  lessonsLearnt: z.string().optional(),
  retrospective: z.string().optional(),
  id: z.string().cuid(),
});

export const EditProjectSchema = z.object({
  icon: z.string().optional(),
  id: z.string().cuid(),
  projectId: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
  estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
  estimatedEnd: z
    .string()
    .transform((val) => val? new Date(val).toISOString(): null)
    .nullable(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(),
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
  outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)).optional(),
  effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
  status: z.string(),
  actualStart: z.string().transform((val) => new Date(val).toISOString()),
  actualEnd: z
  .string()
  .transform((val) => val? new Date(val).toISOString(): null)
  .nullable(),
  lessonsLearnt: z.string().optional(),
  retrospective: z.string().optional(),
  changeType: z.string(),
  colour: z.string().optional(),
  stakeholders: z.string().optional(),
  members: z.array(z.string()),
  pid: z.string().optional(),
  membersTracker: z.array(z.string()).optional(),
});

export const DeleteProjectSchema = z.object({
  id: z.string().cuid(),
});

export const FindProjectByActivityIdSchema = z.object({
  id: z.string().cuid(),
});

export const ActivateProjectSchema = z.object({
  id: z.string().cuid(),
  status: z.string(),
});


