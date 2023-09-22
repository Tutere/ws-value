import { FindActivityMemberSchema, ActivtyCommentSchema } from "~/schemas/activityMember";

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

     //Delete all activity members linked to a project memeber (given userId of projectMember)
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

  readByProjectMemberId: protectedProcedure
    .input(FindActivityMemberSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.activityMember.findMany({
        where: {
          projectMemberId: input.id
        }
      });
    }),

  deleteSpecific: protectedProcedure
  .input(FindActivityMemberSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activityMember.delete(
      {
        where: {
          id: input.id
        }
      }
    );
  }),

  activityComments: publicProcedure
  .input(ActivtyCommentSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activityMember.update(
      {
        where: {
          id: input.id,
        },
        data: {
          activityComments: input.activityComment,
        }
      }
    );
  }),
  
  });