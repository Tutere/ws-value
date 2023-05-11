import { z } from "zod";

export const ActivityChangeSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1).max(255),
    description: z.string(),
    projectId: z.string().cuid(),
    engagementPattern: z.string(),
    valueCreated: z.string().optional(),
    startDate: z.string().transform((val) => new Date(val).toISOString()),
    endDate: z
    .string()
    .transform((val) => val? new Date(val).toISOString(): null)
    .nullable(),
    changeType: z.string(),
    outcomeScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
    effortScore: z.preprocess((val) => Number(val), z.number().min(1).max(10)),
    hours: z.preprocess((val) => Number(val), z.number()),
    status: z.string(),
    members: z.array(z.string()),
    stakeholders: z.string().optional(),
    reportComments: z.string().optional(),
});

export type ActivityChangeSchema = z.infer<typeof ActivityChangeSchema>;

// export const ActivityCreateSchema = z.object({
//     projectId: z.string().cuid(),
//     changeType: z.string(),
//     name: z.string().min(1).max(255),
//     description: z.string().optional(),
//     goal: z.string().min(1),
//     estimatedStart: z.string().transform((val) => new Date(val).toISOString()),
//     estimatedEnd: z.string().transform((val) => new Date(val).toISOString()).optional(),
//     trigger: z.string().optional(),
//     expectedMovement: z.string().optional(), 
//     alternativeOptions: z.string().optional(),
//     estimatedRisk: z.string().optional(),
//     status: z.string(),
//     icon: z.string().optional(),
//     colour: z.string().optional(),
// });

// export type ActivityCreateSchema = z.infer<typeof ActivityCreateSchema>;
