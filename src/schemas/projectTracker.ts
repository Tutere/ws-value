import { z } from "zod";

export const ProjectChangeSchema = z.object({
    projectId: z.string().cuid(),
    changeType: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    goal: z.string().min(1),
    estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
    estimatedEnd: z.string().transform((val) => new Date(val).toISOString()).optional(),
    trigger: z.string().optional(),
    expectedMovement: z.string().optional(), 
    alternativeOptions: z.string().optional(),
    estimatedRisk: z.string().optional(),
    status: z.string(),
    outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
    effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
    actualStart: z.string().transform((val) => new Date(val).toISOString()),
    actualEnd: z.string().transform((val) => new Date(val).toISOString()),
    lessonsLearnt: z.string().optional(),
    retrospective: z.string().optional(),
    icon: z.string().optional(),
    colour: z.string().optional(),
});

export type ProjectChangeSchema = z.infer<typeof ProjectChangeSchema>;

export const ProjectCreateSchema = z.object({
    projectId: z.string().cuid(),
    changeType: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    goal: z.string().min(1),
    estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
    estimatedEnd: z.string().transform((val) => new Date(val).toISOString()).optional(),
    trigger: z.string().optional(),
    expectedMovement: z.string().optional(), 
    alternativeOptions: z.string().optional(),
    estimatedRisk: z.string().optional(),
    status: z.string(),
    icon: z.string().optional(),
    colour: z.string().optional(),
});

export type ProjectCreateSchema = z.infer<typeof ProjectCreateSchema>;