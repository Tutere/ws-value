import {CreateStakeholderResponseSchema,} from "~/schemas/stakeholderResponse";
  
  import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
  } from "~/server/api/trpc";
  
  export const stakeholderResponseRouter = createTRPCRouter({
    create: protectedProcedure
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
  
    read: protectedProcedure.query(({ ctx }) => {
      return ctx.prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        include: {
          members: true,
        },
      });
    }),
  
  });
  