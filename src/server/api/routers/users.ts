
import { FindUserSchema } from "~/schemas/users";
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
  
  });
  