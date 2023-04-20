import { z } from "zod";

export const FindActivityMemberSchema = z.object({
  id: z.string().cuid(),
});

export type FindActivityMemberSchema = z.infer<typeof FindActivityMemberSchema>;