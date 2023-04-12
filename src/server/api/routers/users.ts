
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const usersRouter = createTRPCRouter({
    read: protectedProcedure
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany();
    }),
  
  });
  