import { CreateProjectSchema } from "~/schemas/projects";
import {ReadProjectSchema} from "~/schemas/projects";

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
          outcomeScore: input.outcomeScore,
          effortScore: input.effortScore,
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

  update: protectedProcedure
  .input(ReadProjectSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.project.update(
      {
        where: {
          id: "clfq0alnz0006md08508eo25o",
        },
        data: {
          outcomeScore:input.outcomeScore,
          effortScore: input.effortScore,
        }
      }
    );
  }),
});
