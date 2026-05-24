import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip } from "@/hooks/use-trips";
import { insertTripSchema } from "@shared/schema";
import { PlanFormStep } from "@/components/plan-form-step";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, startOfToday } from "date-fns";
import {
  Calendar as CalendarIcon, MapPin, IndianRupee,
  Landmark, Camera, Loader2, Moon, Sun, LogOut,
  Wallet, Coins, Gem, User, Users, Baby, Users2,
  Plane, Hotel, Utensils, Activity, CalendarDays, Briefcase,
  Accessibility, Building2, Leaf, UtensilsCrossed
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { CinematicSlideshow } from "@/components/cinematic-slideshow";

const formSchema = insertTripSchema.extend({
  days: z.number().min(1, "Trip must be at least 1 day"),
  destination: z.string().min(2, "Please enter a valid destination"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  options: z.object({
    halal: z.boolean().optional(),
    vegetarian: z.boolean().optional(),
    prayerTimes: z.boolean().optional(),
    wheelchair: z.boolean().optional(),
  }).optional().default({}),
});

type FormValues = z.infer<typeof formSchema>;

interface Suggestion {
  display_name: string;
  name: string;
  type: string;
}

interface PlacePreview {
  name: string;
  description: string;
  image?: string;
}

const BUDGET_OPTIONS = [
  { value: "Low", label: "Budget", desc: "Cost-conscious (₹)", icon: <Wallet className="w-8 h-8 mx-auto text-emerald-500" /> },
  { value: "Medium", label: "Moderate", desc: "Balanced comfort (₹₹)", icon: <Coins className="w-8 h-8 mx-auto text-blue-500" /> },
  { value: "High", label: "Luxury", desc: "High-end experience (₹₹₹)", icon: <Gem className="w-8 h-8 mx-auto text-violet-500" /> },
];

const TRAVELER_OPTIONS = [
  { value: "Solo", label: "Solo", desc: "Just me", icon: <User className="w-8 h-8 mx-auto text-primary" /> },
  { value: "Couple", label: "Couple", desc: "Romantic getaway", icon: <Users className="w-8 h-8 mx-auto text-rose-500" /> },
  { value: "Family", label: "Family", desc: "With kids", icon: <Baby className="w-8 h-8 mx-auto text-amber-500" /> },
  { value: "Friends", label: "Friends", desc: "Group trip", icon: <Users2 className="w-8 h-8 mx-auto text-teal-500" /> },
];

// Food & Cuisine added as interest (food RECOMMENDATIONS are still a separate section in trip details)
const ACTIVITY_OPTIONS = [
  "Beaches", "City Sightseeing", "Hiking", "Museums",
  "Shopping", "Nightlife", "Relaxation",
  "Adventure Sports", "Cultural Sites", "Nature", "Photography",
  "Local Food & Cuisine",
];

// INR cost estimates per budget level
const COST_ESTIMATES: Record<string, {
  accommodation: string; food: string; activities: string; daily: string;
}> = {
  Low: {
    accommodation: "₹800 – ₹2,000 / night",
    food: "₹300 – ₹600 / day",
    activities: "₹200 – ₹500 / day",
    daily: "₹1,300 – ₹3,100 / day",
  },
  Medium: {
    accommodation: "₹2,000 – ₹6,000 / night",
    food: "₹600 – ₹1,500 / day",
    activities: "₹500 – ₹1,200 / day",
    daily: "₹3,100 – ₹8,700 / day",
  },
  High: {
    accommodation: "₹6,000 – ₹25,000 / night",
    food: "₹1,500 – ₹5,000 / day",
    activities: "₹1,200 – ₹4,000 / day",
    daily: "₹8,700 – ₹34,000 / day",
  },
};

// Wikipedia category patterns for tourist attractions — tried in order until results found
function buildCategoryNames(city: string): string[] {
  return [
    `Tourist attractions in ${city}`,
    `Heritage sites in ${city}`,
    `Monuments and memorials in ${city}`,
    `Museums in ${city}`,
    `Forts in ${city}`,
    `Temples in ${city}`,
    `Parks in ${city}`,
    `Beaches in ${city}`,
  ];
}

// Titles that are meta/admin articles — never tourist spots
const META_BLOCKLIST = [
  "list of", "lists of", "index of", "history of", "geography of",
  "economy of", "politics of", "culture of", "education in", "transport in",
  "college", "university", "school", "hospital", "airport",
  "railway", "expressway", "highway", "ward ", "municipality", "constituency",
];

function isMetaArticle(title: string): boolean {
  const tl = title.toLowerCase();
  return META_BLOCKLIST.some((b) => tl.includes(b));
}

// Fetch top tourist spots using Wikipedia's curated category system.
// Categories like "Tourist attractions in Mumbai" are maintained by Wikipedia editors
// and contain only genuine tourist spots — the most reliable source.
async function fetchDestinationPlaces(destination: string): Promise<PlacePreview[]> {
  const city = destination.split(",")[0].trim();
  const categories = buildCategoryNames(city);

  try {
    // Try each category in order, stopping as soon as we get enough good results
    for (const category of categories) {
      const catRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(`Category:${category}`)}&cmlimit=20&cmtype=page&format=json&origin=*`
      ).then((r) => r.json());

      const members: Array<{ title: string; pageid: number }> =
        catRes?.query?.categorymembers ?? [];

      const validTitles = members
        .map((m) => m.title)
        .filter((t) => !isMetaArticle(t));

      if (validTitles.length < 2) continue; // try next category

      // Fetch images + extracts for the top members
      const titleBatch = validTitles.slice(0, 10).join("|");
      const detailRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titleBatch)}&prop=pageimages|extracts&exintro&exsentences=2&pithumbsize=600&pilicense=any&format=json&origin=*`
      ).then((r) => r.json());

      const pages = Object.values(detailRes?.query?.pages ?? {}) as any[];

      // Sort: pages with images come first
      const withImage: PlacePreview[] = [];
      const withoutImage: PlacePreview[] = [];

      for (const p of pages) {
        if (!p.title) continue;
        const hasGoodImage =
          p.thumbnail?.source && !p.thumbnail.source.toLowerCase().includes(".svg");
        const entry: PlacePreview = {
          name: p.title as string,
          description: (p.extract ?? "").replace(/<[^>]*>/g, "").slice(0, 130).trim() + "…",
          image: hasGoodImage ? (p.thumbnail.source as string) : undefined,
        };
        if (hasGoodImage) withImage.push(entry);
        else withoutImage.push(entry);
      }

      const combined = [...withImage, ...withoutImage].slice(0, 5);
      if (combined.length >= 2) return combined; // good enough result set
    }

    return []; // nothing found in any category
  } catch {
    return [];
  }
}


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const slideIn = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.25 } },
};

function MouseGlow() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Throttling mousemove for performance
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden hidden sm:block">
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 mix-blend-plus-lighter bg-primary/30 dark:bg-primary/20 pointer-events-none transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)` }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-30 mix-blend-plus-lighter bg-blue-500/30 dark:bg-blue-500/20 pointer-events-none transition-transform duration-700 ease-out will-change-transform"
        style={{ transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)` }}
      />
    </div>
  );
}

export default function Plan() {
  const { mutate, isPending } = useCreateTrip();
  const { theme, toggleTheme } = useDarkMode();
  const { user, logout, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();

  // Destination autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Destination preview sidebar & dynamic cost estimation
  const [placePreviews, setPlacePreviews] = useState<PlacePreview[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const [dynamicCostEst, setDynamicCostEst] = useState<{
    accommodation: string; food: string; activities: string; daily: string;
  } | null>(null);
  const [isEstimatingCost, setIsEstimatingCost] = useState(false);

  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const destinationValue = form.watch("destination");
  const selectedBudget = (form.watch("budget") as string) || "Medium";
  const selectedDays = form.watch("days") || 0;
  const costEst = dynamicCostEst || COST_ESTIMATES[selectedBudget];

  // Destination autocomplete from Nominatim
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!destinationValue || destinationValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationValue)}&format=json&limit=6&addressdetails=1&featuretype=city`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: any[] = await res.json();
        const filtered = data
          .filter((d) => ["city", "town", "village", "country", "state", "region", "administrative"].includes(d.type))
          .map((d) => ({ display_name: d.display_name, name: d.name, type: d.type }));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destinationValue]);

  // Fetch tourist places and dynamic cost estimates for sidebar preview (triggered when destination or budget changes)
  useEffect(() => {
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    if (!destinationValue || destinationValue.length < 3) {
      setPlacePreviews([]);
      setDynamicCostEst(null);
      return;
    }
    previewDebounceRef.current = setTimeout(() => {
      setIsLoadingPlaces(true);
      setIsEstimatingCost(true);

      Promise.allSettled([
        fetchDestinationPlaces(destinationValue).then(setPlacePreviews),
        fetch("/api/estimate-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination: destinationValue, budget: selectedBudget })
        }).then(res => res.json()).then(data => {
          if (data.daily) setDynamicCostEst(data);
          else setDynamicCostEst(null);
        })
      ]).finally(() => {
        setIsLoadingPlaces(false);
        setIsEstimatingCost(false);
      });
    }, 1200);
    return () => { if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current); };
  }, [destinationValue, selectedBudget]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = (s: Suggestion) => {
    const parts = s.display_name.split(",").map((p) => p.trim());
    const label = parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : parts[0];
    form.setValue("destination", label, { shouldValidate: true });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleDateSelect = (range: { from: Date; to: Date } | undefined) => {
    setDate(range);
    if (range?.from) form.setValue("startDate", format(range.from, "yyyy-MM-dd"));
    if (range?.to) {
      form.setValue("endDate", format(range.to, "yyyy-MM-dd"));
      form.setValue("days", differenceInDays(range.to, range.from!) + 1);
    }
  };

  // Scroll to top on mount, and handle auto-generation from URL params
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(window.location.search);
    const dest = params.get("dest");
    const auto = params.get("auto");
    const daysStr = params.get("days");
    
    if (dest) {
      form.setValue("destination", dest, { shouldValidate: true });
      if (auto === "true") {
        const d = parseInt(daysStr || "5", 10);
        const today = new Date();
        const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Start tomorrow
        const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + d - 1);
        
        setDate({ from: fromDate, to: toDate });
        form.setValue("startDate", format(fromDate, "yyyy-MM-dd"), { shouldValidate: true });
        form.setValue("endDate", format(toDate, "yyyy-MM-dd"), { shouldValidate: true });
        form.setValue("days", d, { shouldValidate: true });
        
        // Slightly delay submission so that the UI can catch up with the form values
        setTimeout(() => {
          form.handleSubmit(onSubmit)();
        }, 400);
      }
    }
  }, [form]);

  const onSubmit = (data: FormValues) => mutate(data);
  if (isPending) return <LoadingState />;

  const hasDestination = destinationValue.length >= 3;
  const totalMin = selectedDays > 0 && costEst
    ? `₹${(parseInt(costEst.daily.replace(/[^0-9]/g, "").slice(0, 5)) * selectedDays).toLocaleString("en-IN")}`
    : null;

  return (
    <div className="min-h-screen pb-24 sm:pb-32 relative">
      {/* Cinematic Ken Burns background */}
      <CinematicSlideshow />
      <div className="fixed inset-0 bg-white/70 dark:bg-transparent pointer-events-none transition-colors duration-500 z-0" />
      <MouseGlow />

      {/* Nav */}
      <nav className="border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/50 dark:bg-black/30 sticky top-0 z-40 mb-8">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <SafarixLogo size={34} />
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">Safarix AI</span>
          </Link>
          <div className="flex items-center gap-3">
            {!isLoading && (
              user ? (
                <>
                  <Link href="/my-trips" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Briefcase className="w-4 h-4" /> My Trips
                  </Link>
                  <span className="hidden sm:block text-sm text-slate-500 dark:text-white/60">Hi, {user.name.split(" ")[0]}</span>
                  <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/20 text-sm text-slate-700 dark:text-white/80 hover:bg-white/90 dark:hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hidden sm:block">
                  Log in
                </Link>
              )
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-white/80"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3 text-slate-900 dark:text-white drop-shadow-lg">Plan Your Trip</h1>
          <div className="inline-block px-5 py-2 mt-2 rounded-full bg-white/60 dark:bg-black/30 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm">
            <p className="text-base sm:text-lg text-slate-900 dark:text-white/80 font-medium">Tell us your preferences and we'll build the perfect itinerary.</p>
          </div>
        </motion.div>

        {/* Layout: centered form when no sidebar; 2-col when sidebar visible */}
        <div className={cn(
          "grid gap-10 items-start transition-all duration-500",
          hasDestination
            ? "grid-cols-1 lg:grid-cols-3"
            : "grid-cols-1 max-w-3xl mx-auto"
        )}>

          {/* ── Form Column ── */}
          <div className={hasDestination ? "lg:col-span-2" : ""}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Destination */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="relative z-[100]">
                <PlanFormStep title="Where do you want to go?" description="Enter a city, region, or country." className="relative z-[100]">
                  <div className="relative" ref={suggestionsRef}>
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 w-5 h-5 z-10" />
                    <Input
                      {...form.register("destination")}
                      placeholder="e.g., Kyoto, Japan"
                      autoComplete="off"
                      className="pl-12 h-14 sm:h-16 text-lg sm:text-xl rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-primary dark:focus:border-white/30 focus:ring-primary/20 dark:focus:ring-white/20 transition-all"
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    />
                    {isFetchingSuggestions && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-white/95 dark:bg-black/95 rounded-xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/30 z-[100] overflow-hidden">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/10 flex items-start gap-3 border-b border-white/40 dark:border-white/10 last:border-0 transition-colors"
                            onMouseDown={() => selectSuggestion(s)}
                          >
                            <MapPin className="w-4 h-4 mt-0.5 text-slate-600 dark:text-white/70 shrink-0" />
                            <div>
                              <div className="font-medium text-sm text-slate-900 dark:text-white">{s.name}</div>
                              <div className="text-xs text-slate-400 dark:text-white/50 truncate max-w-sm">{s.display_name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {form.formState.errors.destination && (
                    <p className="text-destructive mt-2 text-sm">{form.formState.errors.destination.message}</p>
                  )}
                </PlanFormStep>
              </motion.div>

              {/* Date Picker */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
                <PlanFormStep title="When are you traveling?" description="Select your travel dates.">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 sm:h-16 justify-start text-left font-normal text-base sm:text-lg rounded-2xl border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all shadow-xl shadow-black/5 dark:shadow-black/20",
                          !date && "text-slate-400 dark:text-white/50"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-slate-600 dark:text-white/70" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
                              <span className="ml-auto text-slate-700 dark:text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full border border-white/40 dark:border-white/10">
                                {differenceInDays(date.to, date.from) + 1} Days
                              </span>
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick your travel dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 backdrop-blur-xl bg-white/90 dark:bg-black/60 rounded-2xl z-[200] shadow-2xl shadow-black/20 dark:shadow-black/50 border border-white/40 dark:border-white/10" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from ?? new Date()}
                        selected={date as any}
                        onSelect={handleDateSelect as any}
                        numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2}
                        disabled={(d) => d < startOfToday()}
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.startDate && (
                    <p className="text-destructive mt-2 text-sm">Please select a valid date range</p>
                  )}
                </PlanFormStep>
              </motion.div>

              {/* Budget */}
              <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                <PlanFormStep title="What's your budget?" description="Average spend per person per day (excluding flights).">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {BUDGET_OPTIONS.map((option) => (
                      <label key={option.value} className="relative cursor-pointer group">
                        <input type="radio" value={option.value} {...form.register("budget")} className="peer sr-only" />
                        <div className="p-6 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all text-slate-900 dark:text-white shine-hover group-hover:border-white/30 text-center">
                          <div className="mb-3 flex justify-center">{option.icon}</div>
                          <div className="font-bold text-lg mb-1">{option.label}</div>
                          <div className="text-sm text-slate-500 dark:text-white/60">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </PlanFormStep>
              </motion.div>

              {/* Travelers */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                <PlanFormStep title="Who are you traveling with?" description="This helps us suggest appropriate activities and lodging.">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TRAVELER_OPTIONS.map((option) => (
                      <label key={option.value} className="relative cursor-pointer group">
                        <input type="radio" value={option.value} {...form.register("travelers")} className="peer sr-only" />
                        <div className="p-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all text-center text-slate-900 dark:text-white shine-hover group-hover:border-white/30">
                          <div className="mb-2 flex justify-center">{option.icon}</div>
                          <div className="font-bold">{option.label}</div>
                          <div className="text-xs text-slate-500 dark:text-white/60">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </PlanFormStep>
              </motion.div>

              {/* Activities */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                <PlanFormStep title="What are you interested in?" description="Select as many as you like.">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ACTIVITY_OPTIONS.map((activity) => (
                      <label key={activity} className="relative cursor-pointer">
                        <input type="checkbox" value={activity} {...form.register("activities")} className="peer sr-only" />
                        <div className="px-4 py-3 rounded-xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/90 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-primary/30 transition-all text-sm font-medium text-center text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white">
                          {activity}
                        </div>
                      </label>
                    ))}
                  </div>
                </PlanFormStep>
              </motion.div>

              {/* Dietary & Accessibility */}
              <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
                <PlanFormStep title="Dietary & Accessibility" description="Any special requirements?">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Halal */}
                    <label className="relative cursor-pointer group" htmlFor="halal">
                      <input
                        id="halal" type="checkbox" className="peer sr-only"
                        onChange={(e) => form.setValue("options.halal", e.target.checked)}
                      />
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all text-slate-900 dark:text-white group-hover:border-white/30">
                        <div className="p-2 rounded-xl bg-green-500/20 shrink-0">
                          <UtensilsCrossed className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-none">Halal Food</span>
                          <span className="text-xs text-slate-400 dark:text-white/50">Only halal-certified dining options</span>
                        </div>
                      </div>
                    </label>

                    {/* Vegetarian */}
                    <label className="relative cursor-pointer group" htmlFor="vegetarian">
                      <input
                        id="vegetarian" type="checkbox" className="peer sr-only"
                        onChange={(e) => form.setValue("options.vegetarian", e.target.checked)}
                      />
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all text-slate-900 dark:text-white group-hover:border-white/30">
                        <div className="p-2 rounded-xl bg-lime-500/20 shrink-0">
                          <Leaf className="w-5 h-5 text-lime-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-none">Vegetarian</span>
                          <span className="text-xs text-slate-400 dark:text-white/50">Vegetarian-friendly restaurants only</span>
                        </div>
                      </div>
                    </label>

                    {/* Wheelchair */}
                    <label className="relative cursor-pointer group" htmlFor="wheelchair">
                      <input
                        id="wheelchair" type="checkbox" className="peer sr-only"
                        onChange={(e) => form.setValue("options.wheelchair", e.target.checked)}
                      />
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/10 peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/20 transition-all text-slate-900 dark:text-white group-hover:border-white/30">
                        <div className="p-2 rounded-xl bg-blue-500/20 shrink-0">
                          <Accessibility className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold leading-none">Wheelchair Accessible</span>
                          <span className="text-xs text-slate-400 dark:text-white/50">Wheelchair-friendly venues only</span>
                        </div>
                      </div>
                    </label>

                  </div>
                </PlanFormStep>
              </motion.div>

              <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
                <div className="pt-8">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 sm:h-16 text-base sm:text-lg rounded-full font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all magnetic-hover shine-hover overflow-hidden border border-slate-300 dark:border-white/20 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-slate-900 dark:text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center relative gap-2 w-full justify-center">
                        <div className="absolute -inset-1 rounded-full bg-white/30 animate-pulse" />
                        <Loader2 className="w-5 h-5 animate-spin relative z-10" /> 
                        <span className="relative z-10 tracking-[0.2em] text-sm uppercase">Synthesizing...</span>
                      </div>
                    ) : (
                      <><Plane className="w-5 h-5 mr-2" /> Generate My Trip Plan</>
                    )}
                  </Button>
                  <div className="flex justify-center mt-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/30 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm">
                      <p className="text-center text-sm font-semibold text-slate-800 dark:text-white/70">
                        This may take 15–20 seconds to generate the best results.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </form>
          </div>

          {/* ── Right Sidebar (animated in/out) ── */}
          <AnimatePresence mode="wait">
            {hasDestination && (
              <motion.div
                key="sidebar"
                variants={slideIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5 lg:sticky lg:top-28"
              >
                {/* Cost Estimate Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="backdrop-blur-xl bg-white/60 dark:bg-black/40 rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-5"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <IndianRupee className="w-5 h-5 text-green-400" />
                    Estimated Costs (₹ INR)
                    {isEstimatingCost && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 dark:text-white/50 ml-auto" />}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { id: "accommodation", label: <><Hotel className="w-4 h-4 inline-block mr-1 text-blue-400" /> Accommodation</>, value: costEst.accommodation },
                      { id: "food", label: <><Utensils className="w-4 h-4 inline-block mr-1 text-orange-400" /> Food & Dining</>, value: costEst.food },
                      { id: "activities", label: <><Activity className="w-4 h-4 inline-block mr-1 text-violet-400" /> Activities</>, value: costEst.activities },
                      { id: "daily", label: <><CalendarDays className="w-4 h-4 inline-block mr-1 text-emerald-400" /> Daily Total</>, value: costEst.daily },
                    ].map(({ id, label, value }, si) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + si * 0.06, duration: 0.3 }}
                        className="flex justify-between items-center py-1.5 border-b border-white/40 dark:border-white/10 border-dashed last:border-0"
                      >
                        <span className="text-slate-500 dark:text-white/60">{label}</span>
                        <span className="font-semibold text-xs text-right max-w-[140px] text-slate-900 dark:text-white">{value}</span>
                      </motion.div>
                    ))}
                    {selectedDays > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/40 dark:border-white/10 flex justify-between items-center font-bold text-primary drop-shadow-sm">
                        <span>For {selectedDays} {selectedDays === 1 ? "day" : "days"}</span>
                        <span className="text-sm text-slate-900 dark:text-white">{costEst.daily.split(" – ")[0]} × {selectedDays}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-white/40 mt-3 italic">*Estimates per person, excludes flights. Based on {selectedBudget.toLowerCase()} budget.</p>
                </motion.div>

                {/* Top Spots Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="backdrop-blur-xl bg-white/60 dark:bg-black/40 rounded-2xl border border-white/40 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-5"
                >
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Landmark className="w-5 h-5 text-primary" />
                    {`Top Spots in ${destinationValue.split(",")[0]}`}
                  </h3>
                  {isLoadingPlaces && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/60 py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      Loading attractions…
                    </div>
                  )}
                  {!isLoadingPlaces && placePreviews.length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-white/50 italic">No results found. Try typing the full city name.</p>
                  )}
                  {placePreviews.length > 0 && (
                    <div className="space-y-3">
                      {placePreviews.map((place, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.07, duration: 0.3 }}
                          className="flex gap-3 items-start"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/60 dark:bg-black/40 shrink-0 flex items-center justify-center border border-white/5">
                            {place.image ? (
                              <img
                                src={place.image}
                                alt={place.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-slate-300 dark:text-white/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white border-0 text-[10px] px-1.5 py-0 h-4">{i + 1}</Badge>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{place.name}</h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-white/60 line-clamp-2 leading-relaxed">{place.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* end grid */}
      </div>
    </div>
  );
}
