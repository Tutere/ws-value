import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { atom, useAtom } from "jotai";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { MonthlyReportCompleteProject } from "~/components/MonthlyReport/MonthlyReportCompletedProject";
import { MonthlyReportProject } from "~/components/MonthlyReport/MonthlyReportProject";
import { DatePicker } from "~/components/ui/datePicker";
import { EmailConfirmation } from "~/components/ui/emailConfirmation";
import { LoadingPage } from "~/components/ui/loading";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";

export const activityStatesAtom = atom<any[][]>([])

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),

  })

  const { data: sessionData } = useSession();

  const {data: projects, isLoading} = api.projects.read.useQuery(undefined, {
    // suspense: true,
  });


  // get all projects and their activities
  const allProjectsAndActivities: { project: Project & { Activity: (Activity & { members: ActivityMember[]; })[]; members: (ProjectMember & { user: User; })[]; }; activities: { activity: Activity & { members: ActivityMember[]; }; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[]; }[]; }[] = [];
  

  //add all activities to each project
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

  /* create an array that copies the structure of projectsWithActivitiesInRange and 
  has a state for each activity --> will be used for Atom to manages which activites 
  have been hidden */
  const statesArray: any[][] = [];
  projectsWithActivitiesInRange && projectsWithActivitiesInRange.map((project) => {
    const activityArrayWithStates =  new Array(project.activitiesInRange.length).fill(false);
    statesArray.push(activityArrayWithStates);
  })

  const [activitiyStates, setArrayAtom1] = useAtom(activityStatesAtom);

  useEffect(() => {
    if (statesArray.length === projectsWithActivitiesInRange.length && statesArray.length > 1) {
      setArrayAtom1(statesArray);
      console.log(activitiyStates);
    }
  }, [statesArray.length, projectsWithActivitiesInRange.length, setArrayAtom1]);
  console.log(activitiyStates);


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
        <EmailConfirmation 
          projectsWithActivitiesInRange={projectsWithActivitiesInRange}
          projectsInDateRange={projectsInDateRange} ></EmailConfirmation>
      </div>


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}
      <div className="flex flex-row m-8 gap-10">
        <div className="flex-[1] border-r-2">
          
            <h1 className="text-3xl font-bold mb-12 underline" >Activities Worked On (by project)</h1>
            
            {projectsWithActivitiesInRange && projectsWithActivitiesInRange.map((project, index) => {
                return (
                    <MonthlyReportProject project={project} projectIndex={index} > </MonthlyReportProject>
                )
            })}
            
        </div>
      {/* --------------------------------PROJECTS COMPLETED-------------------------------- */}

        <div className="flex-1 ">
          <h1 className="text-3xl font-bold mb-12 underline" >Projects Completed</h1>
          
          {projectsInDateRange && projectsInDateRange.map((project) => {

              return (
                <MonthlyReportCompleteProject project={project}></MonthlyReportCompleteProject>
              )
          })}
        </div>
      </div>
    </div>
  )
}

