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
  
  });