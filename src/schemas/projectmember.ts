import { z } from "zod";

export const FindProjectmemberSchema = z.object({
  id: z.string().cuid(),
});

export type FindProjectmemberSchema = z.infer<typeof FindProjectmemberSchema>;