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
import { EmailConfirmation } from "~/components/ui/emailConfirmation";
import { RemoveDialog } from "~/components/ui/removeDialogue";

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
  const allProjectsAndActivities: { project: Project & { Activity: Activity[]; members: ProjectMember[]; }; activities: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; hidden: boolean; setHidden: React.Dispatch<React.SetStateAction<boolean>>; }[]; }[] = [];
  
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

  const useActivityHide = () => {
    const [hidden, setHidden] = useState(false);
  
    return {
      hidden,
      setHidden,
    };
  };


  //add all activities to each project, along with fields and states for later user
  projects && projects.map((project) => {
    const activities: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; hidden: boolean; setHidden: React.Dispatch<React.SetStateAction<boolean>>; }[] = [];
    
    project.Activity.forEach(activity => {
      const projectMembersOfActivity = getProjectMembersOfActivity(activity);
      const { comments, setComments, commentsSaved, setCommentSaved } = useActivityComments( activity);
      const {hidden, setHidden} = useActivityHide();

      //check to make sure that the user is parrt of the activity
      if (projectMembersOfActivity?.some(value => value.userId === sessionData?.user.id)) {
        activities.push({
          activity: activity,
          projectMembers: projectMembersOfActivity,
          commentSaved: commentsSaved,
          setCommentSaved: setCommentSaved,
          comments: comments,
          setComments: setComments,
          hidden: hidden,
          setHidden:setHidden,
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
  const projectsWithActivitiesInRange: { project: Project & { Activity: Activity[]; members: ProjectMember[]; }; activitiesInRange: { activity: Activity; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: string; setComments: React.Dispatch<React.SetStateAction<string>>; hidden: boolean; setHidden: React.Dispatch<React.SetStateAction<boolean>>; }[]; }[] = [];

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
    const activitiesInRange: { activity: any; projectMembers: (ProjectMember & { user: User; ActivityMember: ActivityMember[]; })[] | undefined; commentSaved: boolean; setCommentSaved: React.Dispatch<React.SetStateAction<boolean>>; comments: any; setComments: React.Dispatch<any>; hidden: boolean; setHidden: React.Dispatch<React.SetStateAction<boolean>>; }[] = [];

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
  
  //email setup .... should this be in it's own component?

  const activitiesForEmail = projectsWithActivitiesInRange.map(project => {
    let allActivitiesHidden = true;
    project.activitiesInRange.forEach(element => {
      if (element.hidden === false) {
        allActivitiesHidden = false;
      }
    })
    const activities = project.activitiesInRange.filter(activity => !activity.hidden)
    .map(activity => `
      <div style="display: flex; align-items: center; margin-bottom: 0px; padding-bottom: 0px; margin-left: 20px;">
        <p style="margin-right: 5px;">${project.project.icon}</p>
        <p style="margin-right: 5px;"><b>${activity.activity.name}</b></p>
        <p className="ml-1">
        ${activity.activity.endDate ? (
          "- Completed: " +
        activity.activity.endDate?.toDateString()
        ): (
          " - Ongoing (not yet completed)"
        )}
        </p>
      </div>
      <ul style="margin-top: 0px; padding-top: 0px;">
        <li>Contributors: ${activity.projectMembers?.map(pm => pm.user.name).join(", ")}</li>
        <li>Stakeholders: ${activity.activity.stakeholders === "" ? activity.activity.stakeholders : "N/A"}</li>
        <li>Description: ${activity.activity.description}</li>
        <li>Value Statement: ${activity.activity.valueCreated}</li>
        <li style="white-space: pre-wrap;">Additional Comments: ${activity.comments ? activity.comments.replace(/\n/g, '<br>') : ""}</li>
      </ul>
    `).join('');
  
    return `
      <div style="margin-bottom: 30px;">
        <p style="font-size: 15px; margin-bottom: 0px; ${allActivitiesHidden? "display: none;" : ""}"><b>${project.project.name}</b></p>
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
          <li>Contributors: ${project.members.map(pm => pm.user.name).join(", ")}</li>
          <li>Stakeholders: ${project.stakeholders}</li>
          <li>Retrospective: ${project.retrospective}</li>
          <li>Lessons Learnt: ${project.lessonsLearnt}</li>
        </ul>

      </div>
    `;
  }).join('\n');

  //used for loading state of button 
  const [emailSending,setEmailSending] = useState(false);

  //to figure out current user email for sending
  const currentUser = api.users.currentUser.useQuery(undefined,{
    suspense:true,
  }).data;

  const sendEmail = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setEmailSending(true);

    emailjs.send('service_0yn0tdg', 'template_i1cq8tc', 
    {
      user_name: sessionData?.user.name,
      user_email: currentUser?.workEmail?.includes("@") ? currentUser.workEmail : currentUser?.email?? "" ,
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
          setEmailSending(false);
      });
  };

 

  return (
    <div>
      {/* --------------------------------CALENDAR-------------------------------- */}

      <div className={cn("grid gap-2", className)}>
        <h1 className="text-2xl font-bold mx-auto mt-4" >Select dates for summary:</h1>
        <DatePicker date={date} setDate={setDate} />
        <EmailConfirmation sendEmail={sendEmail} emailSending={emailSending}></EmailConfirmation>
      </div>


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}
      <div className="flex flex-row m-8 gap-10">
        <div className="flex-[1] border-r-2">
          

            <h1 className="text-3xl font-bold mb-12 underline" >Activities Worked On (by project)</h1>
            
            {projectsWithActivitiesInRange && projectsWithActivitiesInRange.map((project) => {

                //check if user has removed all activities from project
                let allActivitiesHidden = true;
                project.activitiesInRange.forEach(element => {
                  if (element.hidden === false) {
                    allActivitiesHidden = false;
                  }
                })

                return (
                  <div className={allActivitiesHidden === true ? "hidden" : ""}>
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
                            
                            <div className= {activity.hidden === true ? "hidden" :"mb-5 ml-5 w-3/4"}>
                            <Link className="hover:underline"  href={"/activity/" + activity.activity.id} 
                              rel="noopener noreferrer" 
                              target="_blank">
                              <div className="flex">
                                <div>{project.project.icon}</div>
                                <p className="ml-2 font-bold">
                                  {activity.activity.name}
                                </p>
                                <p className="ml-1">
                                  {activity.activity.endDate ? (
                                   " - Completed: " + 
                                  activity.activity.endDate?.toDateString() + " "
                                  ) : (
                                    " - Ongoing (not yet completed)"
                                  )}
                                 
                                </p>
                              </div>
                              </Link>
                              
                              <ul className="list-disc ml-5">
                                <li className="">Contributors: {contributorNames.join(", ")}{" "}</li>
                                <li className="">Stakeholders Involved:{" "} {activity.activity.stakeholders === "" ? "N/A" : activity.activity.stakeholders}{" "}</li>
                                <li className="">Description: {activity.activity.description}{" "}</li>
                                <li className="mb-5">Value Statement: {activity.activity.valueCreated}{" "}</li>
                              </ul>
                              {activity?.commentSaved === false || activity?.comments === ""? (
                                <>

                              <div className="grid w-full max-w-md items-center gap-1.5">
                                  <Label htmlFor="reportComment">Optional Comments (for Monthly report):</Label>
                                  <div className="flex items-center">
                                      <Textarea
                                        className="mr-4 whitespace-pre-wrap resize"
                                        placeholder=""
                                        defaultValue={activity.comments}
                                        onChange={(e) => activity.setComments(e.target.value)}
                                      />
                                      <InfoIcon content="These comments will be used for your monthly report" />
                                  </div>
                                   
                              </div>
                                <Button
                                type="submit"
                                variant={"withIcon"}
                                disabled={mutation.isLoading}
                                className="mt-2 "
                              >
                                <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current"  viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <path clip-rule="evenodd" fill-rule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z"></path>
                                </svg>
                                {mutation.isLoading? "Loading": "Save Comments"}
                              </Button>   
                              </>                    
                              ) : (
                                <>
                                <p className="whitespace-pre-wrap">Optional Comments (for Monthly report): {activity?.comments}{" "}</p>
                                <button
                                  className={cn (buttonVariants({ variant: "withIcon" }),"mt-2")}
                                  onClick={() => project.activitiesInRange[index]?.setCommentSaved(!(project.activitiesInRange[index]?.commentSaved))}
                                >
                                  <svg fill="currentColor" className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"></path>
                                    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"></path>
                                  </svg>
                                Edit Comments
                              </button>
                              </>
                              )}
                              <div className="mt-5">
                                <RemoveDialog 
                                setHidden={project.activitiesInRange[index]?.setHidden ?? (() => {})} 
                                />
                              </div>              
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

