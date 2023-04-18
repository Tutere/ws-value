import { z } from "zod";

export const CreateStakeholderResponseSchema = z.object({
    projectId: z.string().cuid(),
    organisation: z.string().min(1).max(255),
    benefitsRating: z.preprocess((val) => Number(val), z.number().min(1).max(10)).optional(),
    experienceRating: z.preprocess((val) => Number(val), z.number().min(1).max(10)).optional(),
    improvements: z.string().optional(),
    complaints: z.string().optional(),
});

export type CreateStakeholderResponseSchema = z.infer<typeof CreateStakeholderResponseSchema>;