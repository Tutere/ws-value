import { z } from "zod";

export const CreateStakeholderResponseSchema = z.object({
    projectId: z.string().cuid(),
    organisation: z.string().transform((value) => value ===""? "Anonymous" : value),
    benefitsRating: z.preprocess((val) => Number(val), z.number().min(1).max(10)).optional(),
    experienceRating: z.preprocess((val) => Number(val), z.number().min(1).max(10)).optional(),
    improvements: z.string().optional(),
    positives: z.string().optional(),
});

export type CreateStakeholderResponseSchema = z.infer<typeof CreateStakeholderResponseSchema>;

export const ReadStakeholderResponseSchema = z.object({
    id: z.string().cuid(),
});

export type ReadStakeholderResponseSchema = z.infer<typeof ReadStakeholderResponseSchema>;