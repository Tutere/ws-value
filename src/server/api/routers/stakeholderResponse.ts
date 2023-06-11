import {CreateStakeholderResponseSchema,ReadStakeholderResponseSchema} from "~/schemas/stakeholderResponse";
  
  import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const stakeholderResponseRouter = createTRPCRouter({
    create: publicProcedure
      .input(CreateStakeholderResponseSchema)
      .mutation(({ ctx, input }) => {
        return ctx.prisma.stakeholderResponse.create({
          data: {
            projectId: input.projectId,
            organisation: input.organisation,
            benefitsRating: input.benefitsRating,
            experienceRating: input.experienceRating,
            improvements: input.improvements,
            positives: input.positives,
            status: "Active",
          },
        });
      }),
  
    read: protectedProcedure
    .input(ReadStakeholderResponseSchema)
    .query(({ ctx,input }) => {
      return ctx.prisma.stakeholderResponse.findMany({
        where: {
          projectId: input.id,
          NOT: {
            status:"Deleted",
          }
        },
      });
    }),

    readSpecific: protectedProcedure
    .input(ReadStakeholderResponseSchema)
    .query(({ ctx,input }) => {
      return ctx.prisma.stakeholderResponse.findUnique({
        where: {
          id: input.id,
        },
        include: {
          project: true,
        }
      });
    }),

    delete: protectedProcedure
    .input(ReadStakeholderResponseSchema)
    .mutation(({ ctx,input }) => {
      return ctx.prisma.stakeholderResponse.delete({
        where: {
          id: input.id,
        }
      });
    }),

    softDelete: protectedProcedure
    .input(ReadStakeholderResponseSchema)
    .mutation(({ ctx,input }) => {
      return ctx.prisma.stakeholderResponse.updateMany({
        where: {
          id: input.id,
        },
        data: {
          status:"Deleted",
        }
      });
    }),
  
  });
  