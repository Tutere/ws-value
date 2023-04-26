import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { projectsRouter } from "./routers/projects";
import {activitiesRouter} from  "./routers/activities";
import { projectTrackerRouter } from "./routers/projectTracker";
import { activityTrackerRouter } from "./routers/activityTracker";
import { usersRouter } from "./routers/users";
import { stakeholderResponseRouter } from "./routers/stakeholderResponse";
import { projectMemberRouter } from "./routers/projectMember";
import { activityMemberRouter } from "./routers/activityMember";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  projects: projectsRouter,
  activities: activitiesRouter,
  projectTracker: projectTrackerRouter,
  activityTracker: activityTrackerRouter,
  users: usersRouter,
  stakeholderResponse: stakeholderResponseRouter,
  projectmember: projectMemberRouter,
  activitymember: activityMemberRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
