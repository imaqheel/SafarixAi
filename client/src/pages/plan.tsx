import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip } from "@/hooks/use-trips";
import { insertTripSchema } from "@shared/schema";
import { PlanFormStep } from "@/components/plan-form-step";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, MapPin, DollarSign, Users, Palmtree, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Extended form schema with strict validation
const formSchema = insertTripSchema.extend({
  days: z.number().min(1, "Trip must be at least 1 day"),
  destination: z.string().min(2, "Please enter a valid destination"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type FormValues = z.infer<typeof formSchema>;

const BUDGET_OPTIONS = [
  { value: "Low", label: "Budget", desc: "Cost-conscious ($)", icon: "💵" },
  { value: "Medium", label: "Moderate", desc: "Balanced comfort ($$)", icon: "💰" },
  { value: "High", label: "Luxury", desc: "High-end experience ($$$)", icon: "💎" },
];

const TRAVELER_OPTIONS = [
  { value: "Solo", label: "Solo", desc: "Just me", icon: "👤" },
  { value: "Couple", label: "Couple", desc: "Romantic getaway", icon: "💑" },
  { value: "Family", label: "Family", desc: "With kids", icon: "👨‍👩‍👧‍👦" },
  { value: "Friends", label: "Friends", desc: "Group trip", icon: "👯" },
];

const ACTIVITY_OPTIONS = [
  "Beaches", "City Sightseeing", "Hiking", "Museums", 
  "Shopping", "Food Tours", "Nightlife", "Relaxation",
  "Adventure Sports", "Cultural Sites", "Nature", "Photography"
];

export default function Plan() {
  const { mutate, isPending } = useCreateTrip();
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      days: 0,
      budget: "Medium",
      travelers: "Couple",
      activities: [],
      options: {},
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  const handleDateSelect = (range: { from: Date; to: Date } | undefined) => {
    setDate(range);
    if (range?.from) {
      form.setValue("startDate", format(range.from, "yyyy-MM-dd"));
    }
    if (range?.to) {
      form.setValue("endDate", format(range.to, "yyyy-MM-dd"));
      const days = differenceInDays(range.to, range.from!) + 1;
      form.setValue("days", days);
    }
  };

  if (isPending) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 mb-8">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Wonderplan</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Plan Your Trip</h1>
          <p className="text-xl text-muted-foreground">Tell us your preferences and we'll build the perfect itinerary.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <PlanFormStep 
            title="Where do you want to go?"
            description="Enter a city, region, or country."
          >
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                {...form.register("destination")}
                placeholder="e.g., Kyoto, Japan" 
                className="pl-12 h-16 text-xl rounded-2xl shadow-sm border-gray-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            {form.formState.errors.destination && (
              <p className="text-destructive mt-2 text-sm">{form.formState.errors.destination.message}</p>
            )}
          </PlanFormStep>

          <PlanFormStep 
            title="When are you traveling?"
            description="Select your travel dates."
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-16 justify-start text-left font-normal text-lg rounded-2xl border-gray-200",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                        <span className="ml-auto text-muted-foreground text-sm font-medium bg-secondary px-3 py-1 rounded-full">
                          {differenceInDays(date.to, date.from) + 1} Days
                        </span>
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date as any} // Typing issue with react-day-picker range
                  onSelect={handleDateSelect as any}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.startDate && (
              <p className="text-destructive mt-2 text-sm">Please select a valid date range</p>
            )}
          </PlanFormStep>

          <PlanFormStep 
            title="What's your budget?"
            description="The average spend per person per day (excluding flights)."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map((option) => (
                <label key={option.value} className="relative cursor-pointer group">
                  <input 
                    type="radio" 
                    value={option.value} 
                    {...form.register("budget")} 
                    className="peer sr-only"
                  />
                  <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all shadow-sm">
                    <div className="text-3xl mb-3">{option.icon}</div>
                    <div className="font-bold text-lg mb-1">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </PlanFormStep>

          <PlanFormStep 
            title="Who are you traveling with?"
            description="This helps us suggest appropriate activities and lodging."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TRAVELER_OPTIONS.map((option) => (
                <label key={option.value} className="relative cursor-pointer group">
                  <input 
                    type="radio" 
                    value={option.value} 
                    {...form.register("travelers")} 
                    className="peer sr-only"
                  />
                  <div className="p-4 rounded-2xl border-2 border-gray-100 bg-white hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 transition-all shadow-sm text-center">
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-bold">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </PlanFormStep>

          <PlanFormStep 
            title="What are you interested in?"
            description="Select as many as you like."
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACTIVITY_OPTIONS.map((activity) => (
                <label key={activity} className="relative cursor-pointer">
                  <input 
                    type="checkbox" 
                    value={activity} 
                    {...form.register("activities")} 
                    className="peer sr-only"
                  />
                  <div className="px-4 py-3 rounded-xl border-2 border-gray-100 bg-white hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white transition-all text-sm font-medium text-center">
                    {activity}
                  </div>
                </label>
              ))}
            </div>
          </PlanFormStep>

          <PlanFormStep 
            title="Dietary & Accessibility"
            description="Any special requirements we should know about?"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-3 p-4 border rounded-xl bg-white">
                <Checkbox 
                  id="halal" 
                  onCheckedChange={(checked) => form.setValue("options.halal", checked === true)}
                />
                <label htmlFor="halal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Halal Food Options
                </label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-xl bg-white">
                <Checkbox 
                  id="vegetarian" 
                  onCheckedChange={(checked) => form.setValue("options.vegetarian", checked === true)}
                />
                <label htmlFor="vegetarian" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Vegetarian Friendly
                </label>
              </div>
            </div>
          </PlanFormStep>

          <div className="pt-8">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-16 text-lg rounded-full font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1"
              disabled={isPending}
            >
              {isPending ? "Generating Itinerary..." : "Generate My Trip Plan"}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              This may take 15-20 seconds to generate the best results.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
