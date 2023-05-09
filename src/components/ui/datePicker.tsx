import { Button } from "./Button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "src/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker";
import { Calendar } from "src/components/ui/calendar"
import { format } from "date-fns"




export function DatePicker(props: { date: DateRange | undefined, setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>}) {

    return (
        <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className="mx-auto w-1/5"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {props.date?.from ? (
              props.date.to ? (
                <>
                  {format(props.date.from, "dd LLL, y")} -{" "}
                  {format(props.date.to, "dd LLL, y")}
                </>
              ) : (
                format(props.date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={props.date?.from}
            selected={props.date}
            onSelect={(date) => props.setDate(date as DateRange)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      
    );
  }
  