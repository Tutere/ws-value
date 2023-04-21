import { FindProjectmemberSchema } from "~/schemas/projectmember";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const projectMemberRouter = createTRPCRouter({
    read: protectedProcedure
    .input(FindProjectmemberSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.projectMember.findMany({
        where: {
          projectId: input.id,
        }

      });
    }),

    readSpecific: protectedProcedure
    .input(FindProjectmemberSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.projectMember.findMany({
        where: {
          id: input.id
        }
      });
    }),

    delete: protectedProcedure
    .input(FindProjectmemberSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.projectMember.deleteMany({
        where: {
          userId: input.id,
        }
      });
    }),


  
  });