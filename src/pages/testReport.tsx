import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from 'react';
import { DateRange } from "react-day-picker";
import { Button, buttonVariants } from "~/components/ui/Button";
import { Textarea } from "~/components/ui/TextArea";
import { DatePicker } from "~/components/ui/datePicker";
import { InfoIcon } from "~/components/ui/infoIcon";
import { useZodForm } from "~/hooks/useZodForm";
import { ReportCommentSchema } from "~/schemas/activities";
import { ActivityChangeSchema } from "~/schemas/activityTracker";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";
import emailjs from '@emailjs/browser';
import { EmailConfirmation } from "~/components/ui/emailConfirmation";
import { RemoveDialog } from "~/components/ui/removeDialogue";
import { LoadingPage } from "~/components/ui/loading";
import { MonthlyReportProject } from "~/components/MonthlyReport/MonthlyReportProject";

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),

  })

  const { data: sessionData } = useSession();

  const {data: projects, isLoading} = api.projects.read.useQuery(undefined, {
    suspense: true,
  });


  // get all projects and their activities (so all hooks used each render)
  const allProjectsAndActivities: { project: Project & { Activity: (Activity & { members: ActivityMember[]; })[]; members: (ProjectMember & { user: User; })[]; }; activities: { activity: Activity & { members: ActivityMember[]; }; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[]; }[]; }[] = [];
  

  //add all activities to each project, along with fields and states for later user
  projects && projects.map((project) => {
    const activities: { activity: Activity & { members: ActivityMember[]; }; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[]; }[] = [];
    
    project.Activity.forEach(activity => {
    const projectMembersOfActivity: any[] = []
    activity.members.forEach(element => projectMembersOfActivity.push(element.members));


      //check to make sure that the user is parrt of the activity
      if (projectMembersOfActivity?.some(value => value.userId === sessionData?.user.id)) {
        activities.push({
          activity: activity,
          projectMembers: projectMembersOfActivity,
        });
      }
    })


    if (activities.length > 0) {
      allProjectsAndActivities.push({
        project: project,
        activities: activities,
      });
    }
  });

  //setup for all activities and projects in date range

  const projectsInDateRange: (Project & { Activity: Activity[]; members: (ProjectMember & { user: User; })[]; })[] = [];
  const projectsWithActivitiesInRange: { project: Project & { Activity: (Activity & { members: ActivityMember[]; })[]; members: (ProjectMember & { user: User; })[]; }; activitiesInRange: { activity: Activity & { members: ActivityMember[]; }; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[]; }[]; }[] = [];

  projects && projects.map((project) => {

    const projectEnd = project.actualEnd?.getTime()
    const selectedEnd = date?.to?.getTime()
    const selectedStart = date?.from?.getTime()

    if (projectEnd && selectedEnd && selectedStart
      && projectEnd <= selectedEnd + 86400000 //add one day worth of milliseconds because date defaults to midnight
      && projectEnd >= selectedStart
      &&project.status === "Complete") {
        projectsInDateRange.push(project);
    }
  })
  
  allProjectsAndActivities && allProjectsAndActivities.map((element) => {
    const activitiesInRange: { activity: Activity & { members: ActivityMember[]; }; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[]; }[] = [];

    element.activities.forEach(activity => {
    const activityEnd = activity.activity.endDate?.getTime();
    const activityStart = activity.activity.startDate?.getTime();
    const activityStatus = activity.activity.status;
    const selectedEnd = date?.to?.getTime();
    const selectedStart = date?.from?.getTime();

        if (
          !activityEnd &&
          activityStart &&
          selectedEnd &&
          selectedStart &&
          activityStart <= selectedEnd + 86400000 &&
          activityStatus !== "Deleted"
        ) {

          activitiesInRange.push(activity)
        }
        else if (
          activityEnd &&
          activityStart &&
          selectedEnd &&
          selectedStart &&
          activityEnd <= selectedEnd + 86400000 &&
          activityEnd >= selectedStart &&
          activityStatus !== "Deleted"
        ) {

          activitiesInRange.push(activity)
        }
  });
    
    if (activitiesInRange.length > 0) {
      projectsWithActivitiesInRange.push({
        project: element.project,
        activitiesInRange: activitiesInRange,
      });
    }
  });


  if (isLoading) {
    return (
      <LoadingPage></LoadingPage>
    );
  }

  return (
    <div>
      {/* --------------------------------CALENDAR-------------------------------- */}

      <div className={cn("grid gap-2", className)}>
        <h1 className="text-2xl font-bold mx-auto mt-4" >Select dates for summary:</h1>
        <DatePicker date={date} setDate={setDate} />
        {/* <EmailConfirmation sendEmail={sendEmail} emailSending={emailSending}></EmailConfirmation> */}
      </div>


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}
      <div className="flex flex-row m-8 gap-10">
        <div className="flex-[1] border-r-2">
          
            <h1 className="text-3xl font-bold mb-12 underline" >Activities Worked On (by project)</h1>
            
            {projectsWithActivitiesInRange && projectsWithActivitiesInRange.map((project) => {
                return (
                    <MonthlyReportProject project={project} > </MonthlyReportProject>
                )
            })}
            
        </div>
        <div className="flex-1 ">
          <h1 className="text-3xl font-bold mb-12 underline" >Projects Completed</h1>
          
          {projectsInDateRange && projectsInDateRange.map((project) => {

              return (
                <>
                <div className="flex mb-5">
                  {project.icon}
                  <Link className="text-xl ml-2 font-bold hover:underline"
                   href={"/" + project.id} 
                   rel="noopener noreferrer" 
                   target="_blank"
                  >{project.name}</Link>
                  <p className="ml-1"> - Completed: {project.actualEnd?.toDateString()} </p>
                </div>
                <div className="mb-5 ml-5 w-3/4">     
                    <p className="">Contributors: {project.members.map(pm => pm.user.name).join(", ")} </p>
                    <p className="">Stakeholders: {project.stakeholders} </p>
                    <p className="">Retrospective: {project.retrospective} </p>
                    <p className="mb-10">Lessons Learnt: {project.lessonsLearnt} </p>
                </div>
                </>
              )
          })}
        </div>
      </div>
    </div>
  )
}

