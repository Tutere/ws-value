"use client"
import * as React from "react"
import { api } from "~/utils/api";
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "~/utils/cn"
import { Button } from  "~/components/ui/Button"
import { Calendar } from "src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "src/components/ui/popover"
import { useRouter } from "next/router";

export default function MonthlyReport({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
    
  })

  const ActivitySummary = () => {

    // const query = api.activities.read.useQuery(undefined, {
    //   suspense: true,
    //   onError: (error) => {
    //     console.error(error);
    //   },
    // })


  }
  

  

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
