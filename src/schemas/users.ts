import { z } from "zod";

export const FindUserSchema = z.object({
  id: z.string().cuid(),
});

export type FindUserSchema = z.infer<typeof FindUserSchema>;

export const WorkEmailSchema = z.object({
  email: z.string()
});

export type WorkEmailSchema = z.infer<typeof WorkEmailSchema>;