import { Activity, ActivityMember, Project, ProjectMember, User } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import { useState } from 'react';
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

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),

  })

  const { data: sessionData } = useSession();

  const { data: projectMembers } = api.projectmember.readByUserId.useQuery({ id: sessionData?.user.id ?? "" }, {
    suspense: true,
  });

  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;

  const mutation = api.activities.reportComments.useMutation();

  const methods = useZodForm({
    schema: ReportCommentSchema,
    defaultValues: {
      id: "", 
    
    },
  });

  const activityMembersList: ActivityMember[] = [];
  const activities: ((Activity & { members: ActivityMember[]; }) | null | undefined)[] = [];

  projectMembers?.forEach(element => {
    const { data: activityMembers } = api.activitymember.readByProjectMemberId.useQuery({ id: element.id ?? "" }, {
      suspense: true,
    });

    if (activityMembers && activityMembers?.length > 0) {
      activityMembers.forEach(element => {
        activityMembersList.push(element)
      })
    }
  });

  activityMembersList.forEach(element => {
    const { data: activity } = api.activities.readSpecific.useQuery({ id: element.activityId ?? "" }, {
      suspense: true,
    });

    activities.push(activity);
  })

  // get all projects and their activities (so all hooks used each render)
  const allProjectsAndActivities: { project: Project & { Activity: Activity[]; members: ProjectMember[]; }; activities: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; }[]; }[] = [];
  
  const getProjectMembersOfActivity = (activity: any) => {
     return api.projectmember.readByActivityId.useQuery({ id: activity.id }).data;
    
  };

  const useActivityComments = (activity: { reportComments: string | null; }) => {
    const [comments, setComments] = useState(activity.reportComments ?? "");
    const [commentsSaved, setCommentSaved] = useState(
      activity.reportComments === null || activity.reportComments === "" ? false : true
    ); //to check if a report comment has already been added
  
    return {
      comments,
      setComments,
      commentsSaved,
      setCommentSaved,
    };
  };

  //add all activities to each project, along with fields and states for later user
  projects && projects.map((project) => {
    const activities: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; }[] = [];
    
    project.Activity.forEach(activity => {
      const projectMembersOfActivity = getProjectMembersOfActivity(activity);
      const { comments, setComments, commentsSaved, setCommentSaved } = useActivityComments( activity);

      activities.push({
        activity: activity,
        projectMembers: projectMembersOfActivity,
        commentSaved: commentsSaved,
        setCommentSaved: setCommentSaved,
        comments: comments,
        setComments: setComments,
      });
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
  const projectsWithActivitiesInRange: { project: Project & { Activity: Activity[]; members: ProjectMember[]; }; activitiesInRange: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; }[]; }[] = [];

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
    const activitiesInRange: { activity: any; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: any; setComments: React.Dispatch<any>; }[] = [];

    element.activities.forEach(activity => {
    const activityEnd = activity.activity.endDate?.getTime();
    const selectedEnd = date?.to?.getTime();
    const selectedStart = date?.from?.getTime();

    if (
          activityEnd &&
          selectedEnd &&
          selectedStart &&
          activityEnd <= selectedEnd + 86400000 &&
          activityEnd >= selectedStart
        ) {

          activitiesInRange.push(activity)
    }});
    
    if (activitiesInRange.length > 0) {
      projectsWithActivitiesInRange.push({
        project: element.project,
        activitiesInRange: activitiesInRange,
      });
    }
  });


  const setValues = async (activity: Activity, comment:string) => {
    await methods.setValue("id",activity.id);
    await methods.setValue("reportComment",comment);

    await mutation.mutateAsync(methods.getValues());
  }

  // lineage
  const mutationActivityTracker = api.activityTracker.edit.useMutation({
                            
  });

  const methodsActivityTracker = useZodForm({
    schema: ActivityChangeSchema,
    defaultValues: {
      changeType: "Edit",
    },
  });

  const setValuesTracking = async (activity: Activity, projMemIds: string[], comments: string,) => {
    methodsActivityTracker.setValue("id", activity.id);
      methodsActivityTracker.setValue("projectId", activity.projectId);
      methodsActivityTracker.setValue("name", activity.name);
      methodsActivityTracker.setValue("description", activity.description);
      methodsActivityTracker.setValue("engagementPattern",activity.engagementPattern ?? "");
      methodsActivityTracker.setValue("valueCreated",activity.valueCreated?.toString());
      methodsActivityTracker.setValue("startDate",activity.startDate?.toISOString()!);
      methodsActivityTracker.setValue("endDate",activity?.endDate?.toISOString() || "");
      methodsActivityTracker.setValue("outcomeScore", activity.outcomeScore);
      methodsActivityTracker.setValue("effortScore", activity.effortScore);
      methodsActivityTracker.setValue("status", activity.status);
      methodsActivityTracker.setValue("hours", activity.hours);
      methodsActivityTracker.setValue("stakeholders", activity.stakeholders!);
      methodsActivityTracker.setValue("members",projMemIds);
      methodsActivityTracker.setValue("reportComments", comments);
  }
  

  const activitiesForEmail = projectsWithActivitiesInRange.map(project => {
    const activities = project.activitiesInRange.map(activity => `
      <div style="display: flex; align-items: center; margin-bottom: 0px; padding-bottom: 0px; margin-left: 20px;">
        <p style="margin-right: 5px;">${project.project.icon}</p>
        <p style="margin-right: 5px;"><b>${activity.activity.name}</b></p>
        <p className="ml-1">
        ${" "}
        - Completed:${" "}
        ${activity.activity.endDate?.toDateString()}
        </p>
      </div>
      <ul style="margin-top: 0px; padding-top: 0px;">
        <li>Outcome score: ${activity.activity.outcomeScore}</li>
        <li>Contributors: ${activity.projectMembers?.map(pm => pm.user.name).join(", ")}</li>
        <li>Stakeholders: ${activity.activity.stakeholders === "" ? activity.activity.stakeholders : "N/A"}</li>
        <li>Value Statement: ${activity.activity.valueCreated}</li>
        <li style="white-space: pre-wrap;">Additional Comments: ${activity.comments ? activity.comments.replace(/\n/g, '<br>') : ""}</li>
      </ul>
    `).join('');
  
    return `
      <div style="margin-bottom: 30px;">
        <p style="font-size: 15px; margin-bottom: 0px;"><b>${project.project.name}</b></p>
        ${activities}
      </div>
    `;
  }).join('\n');

  const projectsForEmail = projectsInDateRange.map(project => {
    return `
      <div style="margin-bottom: 30px;">
        <div style="font-size: 15px; display: flex; align-items: center; margin-bottom: 0px; padding-bottom: 0px;">
          <p style="margin-right: 5px;">${project.icon}</p>
          <p style="margin-right: 5px;"><b>${project.name}</b></p>
          <p className="ml-1">
          ${" "}
          - Completed:${" "}
          ${project.actualEnd?.toDateString()}
          </p>
        </div>

        <ul style="margin-top: 0px; padding-top: 0px;">
          <li>Outcome score: ${project.outcomeScore}</li>
          <li>Effort Score: ${project.effortScore}</li>
          <li>Contributors: ${project.members.map(pm => pm.user.name).join(", ")}</li>
          <li>Stakeholders: ${project.stakeholders}</li>
          <li>Retrospective: ${project.retrospective}</li>
          <li>Lessons Learnt: ${project.lessonsLearnt}</li>
        </ul>

      </div>
    `;
  }).join('\n');

  const [emailSending,setEmailSending] = useState(false);

  const sendEmail = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setEmailSending(true);

    emailjs.send('service_0yn0tdg', 'template_i1cq8tc', 
    {
      user_name: sessionData?.user.name,
      user_email: sessionData?.user.email,
      activitiesCompleted: activitiesForEmail,
      projectsCompleted: projectsForEmail,
    },
     'ZyIRYHSvCLfZ4nSsl')
      .then((result) => {
          alert("Email was sent!")
          setEmailSending(false);
      }, (error) => {
          console.log(error.text);
          alert("Error:" + error.text);
      });
  };

 

  return (
    <div>
      {/* --------------------------------CALENDAR-------------------------------- */}

      <div className={cn("grid gap-2", className)}>
        <h1 className="text-2xl font-bold mx-auto mt-4" >Select dates for summary:</h1>
        <DatePicker date={date} setDate={setDate} />
        <Button className="mx-auto mt-4 bg-green-600" onClick={sendEmail} disabled={emailSending}>
          {emailSending ? "Sending Email..." : " Send Email"}
        </Button>
      </div>


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}
      <div className="flex flex-row m-8 gap-10">
        <div className="flex-[1] border-r-2">
          

            <h1 className="text-3xl font-bold mb-12" >Activities Completed</h1>
            
            {projectsWithActivitiesInRange && projectsWithActivitiesInRange.map((project) => {

                return (
                  <div>
                    <Link className="text-xl mb-5 hover:underline" 
                    href={"/" + project.project.id} 
                    rel="noopener noreferrer" 
                    target="_blank"><b>{project.project.name}</b>
                      {project.project.stakeholders && <span> with <b>{project.project.stakeholders}</b></span>}</Link>

                      {project.activitiesInRange

                      .map((activity, index) => {
                        
                            //get activity member names for later use
                            const contributorNames: (string | null)[] = [];

                            //for lineage work below
                            const projMemIds: string[] = []; 
                        
                            project.activitiesInRange.forEach(act => {
                              if (act.activity.id === activity.activity.id) {
                                act.projectMembers?.forEach(pm => {
                                  contributorNames.push(pm.user.name);
                                  projMemIds.push(pm.id);
                                })
                              }
                            })

                        return (
                          <form
                              onSubmit={async (e) => {
                              e.preventDefault();
                              await activity.setCommentSaved(true);
                              await setValues(activity.activity,activity.comments);
                              await setValuesTracking(activity.activity,projMemIds, activity.comments);
                              await Promise.all([
                                await mutationActivityTracker.mutateAsync(methodsActivityTracker.getValues()),
                              ]);
                              // methods.reset();
                              // methodsActivityTracker.reset();
                            }}
                          >
                            <div className="mb-5 ml-5 w-3/4">
                              <div className="flex">
                                <div>{project.project.icon}</div>
                                <p className="ml-2 font-bold">
                                  {activity.activity.name}
                                </p>
                                <p className="ml-1">
                                  {" "}
                                  - Completed:{" "}
                                  {activity.activity.endDate?.toDateString()}{" "}
                                </p>
                              </div>

                              <p className="">Outcome Score: {activity.activity.outcomeScore}{" "}</p>
                              <p className="">Contributors: {contributorNames.join(", ")}{" "}</p>
                              <p className="">Stakeholders Involved:{" "} {activity.activity.stakeholders === "" ? "N/A" : activity.activity.stakeholders}{" "}</p>
                              <p className="mb-5 mt-5">Value Statement: {activity.activity.valueCreated}{" "}</p>

                              {activity?.commentSaved === false || activity?.comments === ""? (
                                <>

                              <div className="grid w-full max-w-md items-center gap-1.5">
                                  <Label htmlFor="reportComment">Optional Comments for Activity</Label>
                                  <div className="flex items-center">
                                      <Textarea
                                        className="mr-4 whitespace-pre"
                                        placeholder=""
                                        defaultValue={activity.comments}
                                        onChange={(e) => activity.setComments(e.target.value)}
                                      />
                                      <InfoIcon content="These comments will be used for your monthly report" />
                                  </div>
                                   
                              </div>

                                <Button
                                type="submit"
                                variant={"default"}
                                disabled={mutation.isLoading}
                                className="mt-2"
                              >
                                {mutation.isLoading
                                  ? "Loading"
                                  : "Save Comments"}
                              </Button>   
                              </>                    
                              ) : (
                                <>
                                <p className="whitespace-pre-wrap">Optional Comments: {activity?.comments}{" "}</p>
                                <button
                                  className={cn (buttonVariants({ variant: "subtle" }),"mt-2")}
                                  onClick={() => project.activitiesInRange[index]?.setCommentSaved(!(project.activitiesInRange[index]?.commentSaved))}
                                >
                                Edit Comments
                              </button>
                              </>
                              )}
                              
                            </div>
                          </form>
                        );
                      // }
                    })}
                  </div>
                )
              // }

            })}
            
        </div>
        <div className="flex-1 ">
          <h1 className="text-3xl font-bold mb-12" >Projects Completed</h1>
          
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
                    <p className="">Outcome Score: {project.outcomeScore} </p>
                    <p className="">Effort Score: {project.effortScore} </p>
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

