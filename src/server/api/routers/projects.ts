import { CreateProjectSchema, EditProjectSchema, CompleteProjectSchema,
   DeleteProjectSchema, FindProjectByActivityIdSchema } from "~/schemas/projects";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          goal: input.goal,
          estimatedStart: input.estimatedStart,
          estimatedEnd: input.estimatedEnd,
          trigger: input.trigger,
          expectedMovement: input.expectedMovement,
          alternativeOptions: input.alternativeOptions,
          estimatedRisk: input.estimatedRisk,
          status: input.status,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "OWNER",
            },
          },
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

  complete: protectedProcedure
  .input(CompleteProjectSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.project.update(
      {
        where: {
          id: input.id,
        },
        data: {
          outcomeScore:input.outcomeScore,
          effortScore: input.effortScore,
          actualStart: input.actualStart,
          actualEnd: input.actualEnd,
          lessonsLearnt: input.lessonsLearnt,
          retrospective:input.retrospective,
          status: input.status,
        }
      }
    );
  }),

  edit: protectedProcedure
  .input(EditProjectSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.project.update(
      {
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          goal: input.goal,
          estimatedStart: input.estimatedStart,
          estimatedEnd: input.estimatedEnd,
          trigger: input.trigger,
          expectedMovement: input.expectedMovement,
          alternativeOptions: input.alternativeOptions,
          estimatedRisk: input.estimatedRisk,
        }
      }
    );
  }),

  delete: protectedProcedure
  .input(DeleteProjectSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.project.delete(
      {
        where: {
          id: input.id,
        },
      }
    );
  }),

  findByActivityId: protectedProcedure
  .input(FindProjectByActivityIdSchema)
  .query(({ ctx, input }) => {
    return ctx.prisma.project.findFirst({
      where: {
        Activity: {
          some: {
            id: input.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }),

});
