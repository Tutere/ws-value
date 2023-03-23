import { CreateActivitySchema } from "~/schemas/activities";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const activitiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateActivitySchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.activity.create({
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          engagementPattern: input.engagementPattern,
        },
      });
    }),

  read: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.activity.findMany();
  }),
});
