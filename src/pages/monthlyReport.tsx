"use client"
import * as React from "react"
import { api } from "~/utils/api";
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "~/utils/cn"
import { Button } from  "~/components/ui/Button"
import { Calendar } from "src/components/ui/calendar"
import { useZodForm } from "~/hooks/useZodForm";
import { FindProjectmemberSchema } from "~/schemas/projectmember";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover"
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Activity, ActivityMember } from "@prisma/client";

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
    
  })
  const { data: sessionData } = useSession();

  const { data: projectMembers } = api.projectmember.readByUserId.useQuery({id: sessionData?.user.id?? ""}, {
    suspense: true,
  });

  const activityMembersList: ActivityMember[] = [];
  const activities: ((Activity & { members: ActivityMember[]; }) | null | undefined)[] = [];

  projectMembers?.forEach(element => { 
    const { data: activityMembers } = api.activitymember.readByProjectMemberId.useQuery({id: element.id?? ""}, {
      suspense: true,
    });

    if (activityMembers && activityMembers?.length > 0) {
      activityMembers.forEach(element => {
        activityMembersList.push(element)
      })
    } 
  });

  activityMembersList.forEach(element => {
    const { data: activity } = api.activities.readSpecific.useQuery({id: element.activityId?? ""}, {
      suspense: true,
    });

    activities.push(activity);
  })

  console.log(activities);


  return (

  <div>


    
    {/* --------------------------------CALENDAR-------------------------------- */}

    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            // className={cn(
            //   "w-[300px] justify-start text-left font-normal",
            //   !date && "text-muted-foreground"
            // )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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

    {/* --------------------------------PROJECTS + ACTIVITIES COMPLETED-------------------------------- */}
      <div className="m-8">
        <h1 className="text-3xl font-bold mb-12" >Completed Activities</h1>
        {/* this is where we map all the projects with activities within the time period selected */}
        <p className="text-xl mb-5"><b>Project Title</b> with <b>Stakeholder Name</b></p>
        {/* this is where we map all the activities for the project within the time period selected */}
        <p><b>Activity Title</b></p>
        <p><b>Completed On: </b> Date Completed </p>
        <p className="my-5">Engagement + Outcome </p>
      </div>

  </div>
  )
}
