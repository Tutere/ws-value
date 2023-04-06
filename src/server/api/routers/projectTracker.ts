import { ProjectChangeSchema} from "~/schemas/projectTracker";
 
 import {
   createTRPCRouter,
   publicProcedure,
   protectedProcedure,
 } from "~/server/api/trpc";
 
 export const projectTrackerRouter = createTRPCRouter({
   create: protectedProcedure
     .input(ProjectChangeSchema)
     .mutation(({ ctx, input }) => {
       return ctx.prisma.projectTracker.create({
         data: {
            projectId: input.projectId,
            changeType: input.changeType,
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
            outcomeScore:input.outcomeScore,
            effortScore: input.effortScore,
            actualStart: input.actualStart,
            actualEnd: input.actualEnd,
            lessonsLearnt: input.lessonsLearnt,
            retrospective:input.retrospective,
         },
       });
     }),
 
 });
 