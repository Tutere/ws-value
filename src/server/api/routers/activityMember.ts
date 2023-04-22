import { FindActivityMemberSchema } from "~/schemas/activityMember";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const activityMemberRouter = createTRPCRouter({
    read: protectedProcedure
    .input(FindActivityMemberSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.activityMember.findMany({
        where: {
          activityId: input.id,
        }

      });
    }),

    readSpecific: protectedProcedure
    .input(FindActivityMemberSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.activityMember.findMany({
        where: {
          id: input.id
        }
      });
    }),

     //Delete all activity members linked to a project memeber (given userId)
  delete: protectedProcedure
  .input(FindActivityMemberSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activityMember.deleteMany(
      {
        where: {
          members: {
            id:input.id,
          }
        }
      }
    );
  }),
  
  });