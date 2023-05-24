import {
  CreateProjectSchema,
  EditProjectSchema,
  CompleteProjectSchema,
  DeleteProjectSchema,
  FindProjectByActivityIdSchema,
  ActivateProjectSchema,
} from "~/schemas/projects";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          icon: input.icon,
          colour: input.colour,
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
          stakeholders: input.stakeholders,
          pid: input.pid,
          members: {
            createMany: {
              data: input.members.map((member) => {
                return {
                  userId: member,
                  role: "OWNER",
                };
              }),
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
        NOT: {
          status: "Deleted",
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        Activity: true,
      },
    });
  }),

  complete: protectedProcedure
    .input(CompleteProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          outcomeScore: input.outcomeScore,
          effortScore: input.effortScore,
          actualStart: input.actualStart,
          actualEnd: input.actualEnd,
          lessonsLearnt: input.lessonsLearnt,
          retrospective: input.retrospective,
          status: input.status,
        },
      });
    }),

  edit: protectedProcedure
    .input(EditProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          icon: input.icon,
          colour: input.colour,
          name: input.name,
          description: input.description,
          goal: input.goal,
          estimatedStart: input.estimatedStart,
          estimatedEnd: input.estimatedEnd,
          trigger: input.trigger,
          expectedMovement: input.expectedMovement,
          alternativeOptions: input.alternativeOptions,
          estimatedRisk: input.estimatedRisk,
          stakeholders: input.stakeholders,
          pid: input.pid,
          members: {
            createMany: {
              data: input.members.map((member) => {
                return {
                  userId: member,
                  role: "OWNER",
                };
              }),
            },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(DeleteProjectSchema)
    .mutation(({ ctx, input }) => {
      ctx.prisma.project.delete({
        where: {
          id: input.id,
        },
      });
    }),

  softDelete: protectedProcedure
    .input(DeleteProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const deletedProject = await ctx.prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          status: "Deleted",
        },
        include: {
          Activity: true,
        },
      });
      await ctx.prisma.projectTracker.create({
        data: { ...deletedProject, changeType: "Delete", projectId: input.id },
      });

      deletedProject.Activity.forEach(async (activity) => {
        await ctx.prisma.activity.update({
          where: {
            id: activity.id,
          },
          data: {
            status: "Deleted",
          },
        });
        await ctx.prisma.activityTracker.create({
          data: { ...activity, changeType: "Delete", activityId: activity.id },
        });
      });
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

  findByStakeholderResponseId: protectedProcedure
    .input(FindProjectByActivityIdSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.project.findFirst({
        where: {
          StakeholderResponse: {
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

  findByProjectId: protectedProcedure
    .input(FindProjectByActivityIdSchema)
    .query(({ ctx, input }) => {
      return ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          members: true,
        },
      });
    }),

  activate: protectedProcedure
    .input(ActivateProjectSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          status: "Active",
        },
      });
    }),

  FindByProjectId: protectedProcedure
    .input(FindProjectByActivityIdSchema)
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          members: true,
          Activity: {
            where: {
              NOT: {
                status: "Deleted",
              },
            },
          },
        },
      });
      const isMemberFound = project?.members.some((member) => {
        return member.userId === ctx.session?.user.id;
      });

      if (!isMemberFound) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not a member of this project",
        });
      }
      return project;
    }),
});
