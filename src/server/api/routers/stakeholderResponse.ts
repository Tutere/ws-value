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
            complaints: input.complaints,
          },
        });
      }),
  
    read: protectedProcedure
    .input(ReadStakeholderResponseSchema)
    .query(({ ctx,input }) => {
      return ctx.prisma.stakeholderResponse.findMany({
        where: {
          projectId: input.projectId,
        }
      });
    }),
  
  });
  