import { TRPCError } from "@trpc/server";
import { CreateActivitySchema, ReadActivitySchema,
  ReadSpecificActivitySchema, EditActivitySchema, ReportCommentSchema  } from "~/schemas/activities";


import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
export const activitiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateActivitySchema)
    .mutation(async ({ ctx, input }) => {
      const createdActivity = 
      await ctx.prisma.activity.create({
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          engagementPattern: input.engagementPattern,
          valueCreated: input.valueCreated,
          startDate: input.startDate,
          endDate: input.endDate,
          status: input.status,
          outcomeScore: input.outcomeScore,
          effortScore: input.effortScore,
          stakeholders: input.stakeholders,
          hours: input.hours,     
          members: {
            createMany: {
              data: input.members.map(member => {
                return {
                  projectMemberId: member,
                }
              })
            }
          },
        },
      });

      await ctx.prisma.activityTracker.create(
        {
          data: {
            name: createdActivity.name,
            description: createdActivity.description,
            projectId: createdActivity.projectId,
            engagementPattern: createdActivity.engagementPattern,
            valueCreated: createdActivity.valueCreated,
            startDate: createdActivity.startDate,
            endDate: createdActivity.endDate,
            changeType: input.changeType,
            activityId: createdActivity.id,
            outcomeScore: createdActivity.outcomeScore,
            effortScore: createdActivity.effortScore,
            hours: createdActivity.hours,
            status: createdActivity.status,
            stakeholders: createdActivity.stakeholders,
            members: input.members.join(','),
            reportComments:createdActivity.reportComments,
          }
        }
      );

    }),

  read: protectedProcedure
  .input(ReadActivitySchema)
  .query(({ ctx, input }) => {
    return ctx.prisma.activity.findMany(
      {
        where: {
          projectId: input.projectId,
          NOT: {
            status:"Deleted",
          }
        },
        include: {
          members: true,
        },
      },
    );
  }),


  //Delete all activities within a project (given a project ID)
  delete: protectedProcedure
  .input(ReadActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.deleteMany(
      {
        where: {
          projectId: input.projectId,
        }
      }
    );
  }),

  //Soft delete all activities within a project (given a project ID)
  softDelete: protectedProcedure
  .input(ReadActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.updateMany(
      {
        where: {
          projectId: input.projectId,
        },
        data: {
          status:"Deleted",
        }
      }
    );
  }),
  

  readSpecific: protectedProcedure
  .input(ReadSpecificActivitySchema)
  .query(async ({ ctx, input }) => {
    const activity = 
    await ctx.prisma.activity.findUnique(
      {
        where: {
          id: input.id,
        },
        include: {
          members: {
            include : {
              members:{
                include : {
                  user: true,
                }
              }
            }
          },
          project: {
            include:{
              members:true,
            }
          }
        },
      }
    );
    const isMemberFound = activity?.project?.members.some((member) => {
      if (member.userId === ctx.session?.user.id) {
        return true;
      } else if (ctx.session.user.role === 'Admin') { //admin access
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
    return activity;
  }),

  edit: protectedProcedure
  .input(EditActivitySchema)
  .mutation(async ({ ctx, input }) => {
    const editedActivity = 
    await ctx.prisma.activity.update(
      {
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          engagementPattern: input.engagementPattern,
          valueCreated: input.valueCreated,
          startDate: input.startDate,
          endDate: input.endDate,
          outcomeScore: input.outcomeScore,
          effortScore: input.effortScore,
          hours: input.hours,
          stakeholders: input.stakeholders,
          members: {
            createMany: {
              data: input.members.map(member => {
                return {
                  projectMemberId: member,
                }
              })
            }
          },
        }
      }
    );

    await ctx.prisma.activityTracker.create(
      {
        data: {
          name: editedActivity.name,
          description: editedActivity.description,
          projectId: editedActivity.projectId,
          engagementPattern: editedActivity.engagementPattern,
          valueCreated: editedActivity.valueCreated,
          startDate: editedActivity.startDate,
          endDate: editedActivity.endDate,
          changeType: input.changeType,
          activityId: editedActivity.id,
          outcomeScore: editedActivity.outcomeScore,
          effortScore: editedActivity.effortScore,
          hours: editedActivity.hours,
          status: editedActivity.status,
          stakeholders: editedActivity.stakeholders,
          members: input.membersTracking?.join(','),
          reportComments:editedActivity.reportComments,
        }
      }
    );
    
  }),

  reportComments: publicProcedure
  .input(ReportCommentSchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.update(
      {
        where: {
          id: input.id,
        },
        data: {
          reportComments: input.reportComment,
        }
      }
    );
  }),

  //Delete a specific activity within a project (given an activity ID)
  deleteByActivityId: protectedProcedure
  .input(ReadSpecificActivitySchema)
  .mutation(({ ctx, input }) => {
    return ctx.prisma.activity.delete(
      {
        where: {
          id: input.id,
        },
      }
    );
  }),

  softDeleteByActivityId: protectedProcedure
  .input(ReadSpecificActivitySchema)
  .mutation(async ({ ctx, input }) => {
    const deletedActivity = 
    await ctx.prisma.activity.update(
      {
        where: {
          id: input.id,
        },
        data: {
          status: "Deleted"
        },
        include: {
          members: true,
        }
      }
    );

    await ctx.prisma.activityTracker.create(
      {
        data: {
          name: deletedActivity.name,
          description: deletedActivity.description,
          projectId: deletedActivity.projectId,
          engagementPattern: deletedActivity.engagementPattern,
          valueCreated: deletedActivity.valueCreated,
          startDate: deletedActivity.startDate,
          endDate: deletedActivity.endDate,
          changeType: "Delete",
          activityId: deletedActivity.id,
          outcomeScore: deletedActivity.outcomeScore,
          effortScore: deletedActivity.effortScore,
          hours: deletedActivity.hours,
          status: deletedActivity.status,
          stakeholders: deletedActivity.stakeholders,
          members: deletedActivity.members.map(member => member.projectMemberId).join(','),
          reportComments:deletedActivity.reportComments,
        }
      }
    ); 
  }),


});
