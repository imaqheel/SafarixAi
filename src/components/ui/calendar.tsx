import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background border border-input p-0 hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm text-foreground"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex mb-1",
        head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "relative h-10 w-10 text-center text-sm p-0",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-outside)]:bg-primary/5",
          "[&:has([aria-selected])]:bg-primary/10",
          "first:[&:has([aria-selected])]:rounded-l-full",
          "last:[&:has([aria-selected])]:rounded-r-full",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-full aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-colors"
        ),
        day_range_start:
          "day-range-start !bg-primary !text-white rounded-full hover:!bg-primary hover:!text-white",
        day_range_end:
          "day-range-end !bg-primary !text-white rounded-full hover:!bg-primary hover:!text-white",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full",
        day_today:
          "bg-secondary text-foreground font-bold rounded-full ring-2 ring-primary/30",
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
        day_disabled:
          "text-muted-foreground opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:!bg-primary/10 aria-selected:!text-foreground aria-selected:rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className: cls, ...p }) => <ChevronLeft className={cn("h-4 w-4", cls)} {...p} />,
        IconRight: ({ className: cls, ...p }) => <ChevronRight className={cn("h-4 w-4", cls)} {...p} />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"
export { Calendar }
