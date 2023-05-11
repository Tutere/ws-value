"use client"
import * as React from "react"
import { useState } from 'react';
import { api } from "~/utils/api";
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "~/utils/cn"
import { Button } from "~/components/ui/Button"
import { Calendar } from "src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover"
import { useSession } from "next-auth/react";
import { Activity, ActivityMember } from "@prisma/client";
import Link from "next/link";
import { DatePicker } from "~/components/ui/datePicker";
import { TextAreaSection } from "~/components/ui/TextAreaSection";
import { useZodForm } from "~/hooks/useZodForm";
import { ReportCommentSchema } from "~/schemas/activities";
import { buttonVariants } from "~/components/ui/Button"
import { ActivityChangeSchema } from "~/schemas/activityTracker";

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),

  })

  // console.log(date?.from + "" + " TO " + "" + date?.to)

  const { data: sessionData } = useSession();

  const { data: projectMembers } = api.projectmember.readByUserId.useQuery({ id: sessionData?.user.id ?? "" }, {
    suspense: true,
  });

  const query = api.projects.read.useQuery(undefined, {
    suspense: true,
  });

  const projects = query.data;

  // console.log(projects)

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
    // console.log(activity);
  })

  return (

    <div>
      {/* --------------------------------CALENDAR-------------------------------- */}

      <div className={cn("grid gap-2", className)}>
        <h1 className="text-2xl font-bold mx-auto mt-4" >Select dates for summary:</h1>
        <DatePicker date={date} setDate={setDate} />
      </div>


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}

      <div className="flex flex-row m-8 gap-10">

        <div className="flex-[1] border-r-2">
            <h1 className="text-3xl font-bold mb-12" >Activities Completed</h1>
            

            {projects && projects.map((project) => {
              // if (project.Activity.length > 0) {
                let showName = false;
                
                project.Activity.forEach(activity => {
                  const activityEnd = activity.endDate?.getTime()
                  const selectedEnd = date?.to?.getTime()
                  const selectedStart = date?.from?.getTime()


                  if (activityEnd && selectedEnd && selectedStart
                    && activityEnd <= selectedEnd + 86400000 //add one day worth of milliseconds because date defaults to midnight
                    && activityEnd >= selectedStart) {
                      showName = true;
                        }

                });

                if (showName) { //dont need to check if project.Activity lenght > 0 as already know by this stage

                return (
                  <div>
                    <Link className="text-xl mb-5 hover:underline" 
                    href={"/" + project.id} 
                    rel="noopener noreferrer" 
                    target="_blank"><b>{project.name}</b>
                      {project.stakeholders && <span> with <b>{project.stakeholders}</b></span>}</Link>

                      {project.Activity
                      .sort((a,b) => {
                        const aOutcomeScore = a.outcomeScore ? a.outcomeScore : 0;
                        const bOutcomeScore = b.outcomeScore ? b.outcomeScore : 0;
                        return bOutcomeScore - aOutcomeScore;
                      })
                      .map((activity) => {
                        const activityEnd = activity.endDate?.getTime()
                        const selectedEnd = date?.to?.getTime()
                        const selectedStart = date?.from?.getTime()


                        if (activityEnd && selectedEnd && selectedStart
                          && activityEnd <= selectedEnd + 86400000 //add one day worth of milliseconds because date defaults to midnight
                          && activityEnd >= selectedStart) {

                            //get activity member names for later use
                            const contributorNames: (string | null)[] = [];
                            //list of projectMembers linked to this projecy
                            const projectMembersOfActivity = api.projectmember.read.useQuery({id:activity.projectId}).data;
                            //of those projectMembers find which ones are linked to this activity then get their name
                            const projMemIds: string[] = []; //for lineage
                            projectMembersOfActivity?.forEach(element => {
                              element.ActivityMember.forEach(am => {
                                if (activity.id === am.activityId) {
                                  contributorNames.push(element.user.name);
                                  projMemIds.push(element.id);
                                }
                              })
                            });

                            //setup for reportCOmments of each activity
                            const [commentsSaved, setCommentSaved] = useState(activity.reportComments === null || activity.reportComments === "" ? false : true);
                            //to render comment changes on screen without refreshing
                            const [comments,setComments] = useState(activity.reportComments?? "")

                            const mutation = api.activities.reportComments.useMutation({
                            
                            });

                            const methods = useZodForm({
                              schema: ReportCommentSchema,
                              defaultValues: {
                                id: activity.id, 
                              
                              },
                            });


                            //lineage
                            const mutationActivityTracker = api.activityTracker.edit.useMutation({
                            
                            });

                            const methodsActivityTracker = useZodForm({
                              schema: ActivityChangeSchema,
                              defaultValues: {
                                changeType: "Edit",
                                id: activity?.id,
                                projectId: activity?.projectId.toString(),
                                name: activity?.name?.toString(),
                                description: activity?.description?.toString(),
                                engagementPattern: activity?.engagementPattern?.toString(),
                                valueCreated: activity?.valueCreated?.toString(),
                                startDate: activity?.startDate?.toISOString(),
                                endDate: activity?.endDate?.toISOString() || "",
                                outcomeScore: activity?.outcomeScore!,
                                effortScore: activity?.effortScore!,
                                status: activity?.status!,
                                hours: activity?.hours!,
                                members: projMemIds,
                                stakeholders: project?.stakeholders!,
                                reportComments:activity?.reportComments?? "",
                                
                              },
                            });


                        return (
                          <form
                            onSubmit={methods.handleSubmit(async (values) => {
                              await setCommentSaved(true);
                              await setComments(methods.getValues("reportComment"));
                              await methodsActivityTracker.setValue("reportComments", methods.getValues("reportComment"));
                              await Promise.all([
                                await mutation.mutateAsync(values),
                                await(console.log(methodsActivityTracker.getValues())),
                                await mutationActivityTracker.mutateAsync(methodsActivityTracker.getValues()),
                              ]);
                              methods.reset();
                            })}
                          >
                            <div className="mb-5 ml-5 w-3/4">
                              <div className="flex">
                                <div>{project.icon}</div>
                                <p className="ml-2 font-bold">
                                  {activity.name}
                                </p>
                                <p className="ml-1">
                                  {" "}
                                  - Completed:{" "}
                                  {activity.endDate?.toDateString()}{" "}
                                </p>
                              </div>

                              <p className="">Outcome Score: {activity.outcomeScore}{" "}</p>
                              <p className="">Contributors: {contributorNames.join(", ")}{" "}</p>
                              <p className="">Stakeholders Involved:{" "} {activity.stakeholders === "" ? "N/A" : activity.stakeholders}{" "}</p>
                              <p className="mb-5 mt-5">Value Statement: {activity.valueCreated}{" "}</p>

                              {commentsSaved === false || comments === ""? (
                                <>
                                <TextAreaSection
                                  infoContent="These comments will be used for your monthly report"
                                  methods={methods}
                                  label="Optional Comments for this activity:"
                                  methodsField="reportComment"
                                  placeHolder=""
                                  defaultValue={comments}
                                /> 
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
                                <p className="">Optional Comments: {comments}{" "}</p>
                                <button
                                  className={cn (buttonVariants({ variant: "subtle" }),"mt-2")}
                                  onClick={() => setCommentSaved(!commentsSaved)}
                                >
                                Edit Comments
                              </button>
                              </>
                              )}
                              
                            </div>
                          </form>
                        );
                      }
                    })}
                  </div>
                )
              }

            })}
            
        </div>
        <div className="flex-1 ">
          <h1 className="text-3xl font-bold mb-12" >Projects Completed</h1>
          
          {projects && projects.map((project) => {

            const projectEnd = project.actualEnd?.getTime()
            const selectedEnd = date?.to?.getTime()
            const selectedStart = date?.from?.getTime()

            if (projectEnd && selectedEnd && selectedStart
              && projectEnd <= selectedEnd + 86400000 //add one day worth of milliseconds because date defaults to midnight
              && projectEnd >= selectedStart
              &&project.status === "Complete") {

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
                    <p className="">Retrospective: {project.retrospective} </p>
                    <p className="mb-10">Lessons Learnt: {project.lessonsLearnt} </p>
                </div>
                </>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}
