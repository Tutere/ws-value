import { z } from "zod";

export const FindActivityMemberSchema = z.object({
  id: z.string().cuid(),
});

export const ActivtyCommentSchema = z.object({
  activityComment: z.string().optional(),
  id: z.string().cuid(),
});

export type FindActivityMemberSchema = z.infer<typeof FindActivityMemberSchema>;