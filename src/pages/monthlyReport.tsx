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

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),

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

  console.log(projects)

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



  const [visible, setVisible] = useState(true);

  return (

    <div>
      {/* --------------------------------CALENDAR-------------------------------- */}

      <div className={cn("grid gap-2", className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd LLL, y")} -{" "}
                    {format(date.to, "dd LLL, y")}
                  </>
                ) : (
                  format(date.from, "dd LLL, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div >


      {/* --------------------------------ACTIVITIES COMPLETED-------------------------------- */}


      <div className="m-8">
        <>
          <h1 className="text-3xl font-bold mb-12" >Completed Activities</h1>

          {projects && projects.map((project) => {
            if (project.Activity.length > 0) { 

              return (
                <>
                  {/* <p className="text-xl mb-5"><b>{project.name}</b>
                    {project.stakeholders && <span> with <b>{project.stakeholders}</b></span>}</p> */}

                  {project.Activity.map((activity) => {
       
                    const activityEnd = activity.endDate?.getTime()
                    const selectedEnd = date?.to?.getTime()
                    const selectedStart = date?.from?.getTime()


                    if (activityEnd && selectedEnd && selectedStart
                      && activityEnd <= selectedEnd
                      && activityEnd >= selectedStart) {

             

                      return (
                          <div className="mb-5 ml-5 w-1/2">

                          <p className="text-xl mb-5"><b>{project.name}</b>
                            {project.stakeholders && <span> with <b>{project.stakeholders}</b></span>}</p>

                          <div >
                            <div className="flex">
                              <div>{project.icon}</div>
                              <p className="ml-2"><b>{activity.name}</b></p>
                            </div>

                            <p className="">Completed: {activity.endDate?.toDateString()} </p>
                            <p className="mt-5">{activity.engagementPattern} </p>
                            <p className="mb-10">{activity.valueCreated} </p>
                          </div>
                        </div>
                      )




                    }


                  })}
                </>
              )
            }

          })}
        </>
      </div>
    </div>
  )
}
