
import { FindUserSchema, WorkEmailSchema } from "~/schemas/users";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const usersRouter = createTRPCRouter({
    read: protectedProcedure
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        include: {
          projects: true,
        },
      });
    }),

    readSpecific: protectedProcedure
    .input(FindUserSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          id: input.id
        },
        include: {
          projects: true,
        },
      });
    }),

    currentUser: protectedProcedure
    .query(({ ctx}) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id
        },
        include: {
          projects: true,
        },
      });
    }),

    updateWorkEmail: protectedProcedure
    .input(WorkEmailSchema)
    .mutation(({ ctx, input}) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id
        },
        data: {
          workEmail: input.email,
        },
      });
    }),

    findUsersByProjectMemberId: protectedProcedure
    .input(FindUserSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          projects: {
            some: {
              id: input.id,
            },
          },
        },
      });
    }),
  
  });
  