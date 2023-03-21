import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  goal: z.string().min(1),
  estimatedStart: z.date().optional(),
  estimatedEnd: z.date().optional(),
  trigger: z.string().optional(),
  expectedMovement: z.string().optional(), 
  alternativeOptions: z.string().optional(),
  estimatedRisk: z.string().optional(),
});

export type CreateProjectSchema = z.infer<typeof CreateProjectSchema>;
