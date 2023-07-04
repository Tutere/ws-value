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
import { Activity } from "@prisma/client";

export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const createdProject = 

      await ctx.prisma.project.create({
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

      await ctx.prisma.projectTracker.create({
        data: {
          changeType: "Create",
          name: createdProject.name,
          createdAt: createdProject.createdAt,
          description: createdProject.description,
          goal: createdProject.goal,
          estimatedStart: createdProject.estimatedStart,
          estimatedEnd: createdProject.estimatedEnd,
          trigger: createdProject.trigger,
          expectedMovement: createdProject.expectedMovement,
          alternativeOptions: createdProject.alternativeOptions,
          estimatedRisk: createdProject.estimatedRisk,
          outcomeScore: createdProject.outcomeScore,
          effortScore: createdProject.effortScore,
          status: createdProject.status,
          actualStart: createdProject.actualStart,
          actualEnd: createdProject.actualEnd,
          lessonsLearnt: createdProject.lessonsLearnt,
          retrospective: createdProject.retrospective,
          projectId: createdProject.id,
          icon: createdProject.icon,
          colour: createdProject.colour,
          stakeholders: createdProject.stakeholders,
          pid: createdProject.pid,
          members: input.members.join(','),
        },
      });
    }),

  read: protectedProcedure.query(({ ctx }) => {

    if (ctx.session.user.id === 'clh8vfdfq0000mj085tgdm0or') { //ganesh access
      return ctx.prisma.project.findMany({
      where: {
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
        Activity: {
          include: {
            members: true,
          }
        }
      },
    });
    } else {
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
          Activity: {
            include: {
              members: true,
            }
          }
        },
      });
    }

    
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
      });

      await ctx.prisma.projectTracker.create({
        data: {
          changeType: "Delete",
          name: deletedProject.name,
          createdAt: deletedProject.createdAt,
          description: deletedProject.description,
          goal: deletedProject.goal,
          estimatedStart: deletedProject.estimatedStart,
          estimatedEnd: deletedProject.estimatedEnd,
          trigger: deletedProject.trigger,
          expectedMovement: deletedProject.expectedMovement,
          alternativeOptions: deletedProject.alternativeOptions,
          estimatedRisk: deletedProject.estimatedRisk,
          outcomeScore: deletedProject.outcomeScore,
          effortScore: deletedProject.effortScore,
          status: deletedProject.status,
          actualStart: deletedProject.actualStart,
          actualEnd: deletedProject.actualEnd,
          lessonsLearnt: deletedProject.lessonsLearnt,
          retrospective: deletedProject.retrospective,
          projectId: input.id,
          icon: deletedProject.icon,
          colour: deletedProject.colour,
          stakeholders: deletedProject.stakeholders,
          pid: deletedProject.pid,
        },
      });

      const projectActivities = await ctx.prisma.activity.findMany({
        where: {
          projectId: input.id,
        },
      });
      const softDeletedActivitiesPromises = projectActivities.map(
        (activity) => {
          console.log("soft deleting activity :", activity.id);
          return ctx.prisma.activity.update({
            where: {
              id: activity.id,
            },
            data: {
              status: "Deleted",
            },
          });
        }
      );

      const updateActivitiesTrackerPromises = projectActivities.map(
        (activity) => {
          console.log("soft deleting activity :", activity.id);
          return ctx.prisma.activityTracker.create({
            data: {
              changeType: "Delete",
              createdAt: activity.createdAt,
              projectId: activity.projectId,
              name: activity.name,
              description: activity.description,
              engagementPattern: activity.engagementPattern,
              valueCreated: activity.valueCreated,
              startDate: activity.startDate,
              endDate: activity.endDate,
              status: activity.status,
              outcomeScore: activity.outcomeScore,
              effortScore: activity.effortScore,
              hours: activity.hours,
              stakeholders: activity.stakeholders,
              reportComments: activity.reportComments,
              activityId: activity.id!,
            },
          });
        }
      );

      await Promise.all([
        ...softDeletedActivitiesPromises,
        ...updateActivitiesTrackerPromises,
      ]);
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
          members: {
            include: {
              user: true,
            }
          },
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
        if (member.userId === ctx.session?.user.id) {
          return true;
        } else if (ctx.session.user.id === 'clh8vfdfq0000mj085tgdm0or') { //ganesh access
          return true;
        } else{
          return false;
        }
         ;
      });

      if (!isMemberFound) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not a member of this project",
        });
      }
      return project;
    }),

    //used for stakeholderResponse page
    PublicFindByProjectId: publicProcedure 
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
});
