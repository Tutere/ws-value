import { CreateActivitySchema, ReadActivitySchema,
  ReadSpecificActivitySchema, EditActivitySchema  } from "~/schemas/activities";


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
          status: input.status,
          outcomeScore: input.outcomeScore,
          effortScore: input.effortScore,
          stakeholders: input.stakeholders

          
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


  //Delete all activities within a project (given a project ID)
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

  readSpecific: protectedProcedure
  .input(ReadSpecificActivitySchema)
  .query(({ ctx, input }) => {
    return ctx.prisma.activity.findUnique(
      {
        where: {
          id: input.id,
        }
      }
    );
  }),

  edit: protectedProcedure
  .input(EditActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.update(
      {
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          engagementPattern: input.engagementPattern,
          valueCreated: input.valueCreated,
          startDate: input.startDate,
          endDate: input.endDate,
        }
      }
    );
  }),

  //Delete a specific activity within a project (given an activity ID)
  deleteByActivityId: protectedProcedure
  .input(ReadSpecificActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.delete(
      {
        where: {
          id: input.id,
        },
      }
    );
  }),


});
