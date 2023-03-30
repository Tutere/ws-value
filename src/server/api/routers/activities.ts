import { CreateActivitySchema } from "~/schemas/activities";
import { ReadActivitySchema } from "~/schemas/activities";

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
          valueCreated: input.valueCreated,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
    }),

  read: protectedProcedure
  .input(ReadActivitySchema)
  .query(({ ctx, input }) => {
    return ctx.prisma.activity.findMany(
      {
        where: {
          projectId: input.projectId,
        }
      }
    );
  }),

  delete: protectedProcedure
  .input(ReadActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.deleteMany(
      {
        where: {
          projectId: input.projectId,
        }
      }
    );
  }),

});
