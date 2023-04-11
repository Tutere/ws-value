import { ActivityChangeSchema} from "~/schemas/activityTracker";

 import {
   createTRPCRouter,
   publicProcedure,
   protectedProcedure,
 } from "~/server/api/trpc";

 export const activityTrackerRouter = createTRPCRouter({
    edit: protectedProcedure
    .input(ActivityChangeSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.activityTracker.create(
        {
          data: {
            name: input.name,
            description: input.description,
            projectId: input.projectId,
            engagementPattern: input.engagementPattern,
            valueCreated: input.valueCreated,
            startDate: input.startDate,
            endDate: input.endDate,
            changeType: input.changeType,
            activityId: input.id,
          }
        }
      );
    }),

    // delete: protectedProcedure
    // .mutation(({ ctx, input }) => {
    //   return ctx.prisma.activityTracker.deleteMany();
    // }),

 });