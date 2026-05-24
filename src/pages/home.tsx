import { HeroSection } from "@/components/ui/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar, CreditCard, Sparkles, Moon, Sun, LogOut, Shield,
  MapPin, Star, ArrowRight, Zap, Globe, Lock,
  Users, TrendingUp, Clock, Rocket,
  Plane, IndianRupee, SearchCheck, Wallet, Quote,
  ChevronLeft, ChevronRight, Hotel, Utensils, Ticket, Compass,
  Minus, Plus
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(target: string, duration = 1800) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (!isInView) return;
    const match = target.match(/[0-9.]+/);
    if (!match) { setDisplay(target); return; }
    const numPart = match[0];
    const num = parseFloat(numPart);
    if (isNaN(num)) { setDisplay(target); return; }
    
    const prefix = target.slice(0, target.indexOf(numPart[0]));
    const suffix = target.slice(target.indexOf(numPart) + numPart.length);
    const isDecimal = numPart.includes(".");
    const steps = 40;
    let step = 0;
    
    const iv = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = num * eased;
      const formatted = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (step >= steps) clearInterval(iv);
    }, duration / steps);
    
    return () => clearInterval(iv);
  }, [isInView, target, duration]);
  
  return { ref, display };
}

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Sparkles,
    title: "AI-Curated Selection",
    description: "Our AI scans thousands of destinations to find the perfect match for your interests, budget, and travel style.",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    Icon: Calendar,
    title: "Hour-by-Hour Plans",
    description: "Get a fully structured itinerary with logical routes, optimal timings, and smooth transitions between activities.",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-700",
  },
  {
    Icon: IndianRupee,
    title: "Real Cost Estimates",
    description: "Every activity, meal, and hotel comes with accurate ₹ INR cost estimates so you never go over budget.",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    Icon: Zap,
    title: "20-Second Generation",
    description: "Fill in your preferences and watch your complete itinerary appear in under 20 seconds. No waiting.",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-700",
  },
  {
    Icon: Globe,
    title: "Any Destination",
    description: "From Rajasthan to Rome, Bali to Brazil — generate a perfectly tailored plan for any city in the world.",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    Icon: Lock,
    title: "Save & Revisit",
    description: "Create a free account to save all your itineraries and access them anytime, from any device.",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-700",
  },
];

const STATS = [
  { value: "50,000+", label: "Trips Planned", Icon: MapPin, color: "text-primary", bg: "bg-primary/10" },
  { value: "120+", label: "Countries Covered", Icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "4.9 / 5", label: "Average Rating", Icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  { value: "<20s", label: "Generation Time", Icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const HOW_IT_WORKS = [
  { Icon: MapPin, step: "01", title: "Pick Your Destination", desc: "Type any city, region, or country. Start with just a name!", color: "text-primary", bg: "bg-primary/10" },
  { Icon: SearchCheck, step: "02", title: "Set Your Preferences", desc: "Tell us your budget, travelers, activities you love, and travel dates.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { Icon: Zap, step: "03", title: "AI Generates in 20s", desc: "Our AI builds a complete personalized itinerary with real costs.", color: "text-violet-500", bg: "bg-violet-500/10" },
  { Icon: Rocket, step: "04", title: "Explore & Customize", desc: "View your itinerary, save it, share it, or print it for your trip.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

// ─── Popular Destinations ──────────────────────────────────────────────────────
const DESTINATIONS = [
  { name: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=85&auto=format&fit=crop", days: "5-7", budget: "₹45K", tag: "Cultural" },
  { name: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85&auto=format&fit=crop", days: "4-5", budget: "₹65K", tag: "Romantic" },
  { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85&auto=format&fit=crop", days: "6-8", budget: "₹35K", tag: "Adventure" },
  { name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85&auto=format&fit=crop", days: "4-5", budget: "₹55K", tag: "Luxury" },
  { name: "Jaipur", country: "India", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=85&auto=format&fit=crop", days: "3-4", budget: "₹12K", tag: "Heritage" },
  { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=85&auto=format&fit=crop", days: "5-7", budget: "₹75K", tag: "Iconic" },
];

const TESTIMONIALS = [
  {
    name: "Fathima", role: "Software Engineer", initials: "F",
    rating: 5,
    text: "I was blown away by how accurate and detailed the itinerary was for my Rajasthan trip. Every cost estimate was spot on and the hidden gems it recommended weren't in any guidebook!",
    dest: "Rajasthan, India",
    gradFrom: "from-violet-500", gradTo: "to-purple-600",
  },
  {
    name: "Backpacker Kumar", role: "Travel Blogger", initials: "BK",
    rating: 5,
    text: "Planned a 10-day Europe trip in under 5 minutes. The day-by-day breakdown with timings saved us from overpacking our schedule. Absolute game-changer!",
    dest: "Europe Tour",
    gradFrom: "from-teal-500", gradTo: "to-cyan-600",
  },
  {
    name: "Cristiano", role: "Teacher", initials: "CR",
    rating: 5,
    text: "As a solo traveler, I loved how it gave safety tips for each destination and recommended the best areas to stay. Felt completely confident with my Goa trip!",
    dest: "Goa, India",
    gradFrom: "from-rose-500", gradTo: "to-pink-600",
  },
];

// ─── Stat Item with Count-Up ─────────────────────────────────────────────────
function StatItem({ value, label, Icon, color, bg, index }: {
  value: string; label: string; Icon: any; color: string; bg: string; index: number;
}) {
  const { ref, display } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="text-center group"
    >
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1 tabular-nums">{display}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ── Budget Estimator Component ──────────────────────────────────────────────
function BudgetEstimator() {
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budgetLevel, setBudgetLevel] = useState<"budget" | "moderate" | "luxury">("moderate");

  const rates = {
    budget:   { hotel: 1500, food: 400, activities: 250, transport: 300 },
    moderate: { hotel: 4000, food: 1000, activities: 700, transport: 600 },
    luxury:   { hotel: 15000, food: 3000, activities: 1800, transport: 1200 },
  };

  const r = rates[budgetLevel];
  const rooms = Math.ceil(travelers / 2);
  const hotelTotal = r.hotel * days * rooms;
  const foodTotal = r.food * days * travelers;
  const activityTotal = r.activities * days * travelers;
  const transportTotal = r.transport * days * travelers;
  const grandTotal = hotelTotal + foodTotal + activityTotal + transportTotal;

  const breakdown = [
    { label: "Accommodation", value: hotelTotal, icon: Hotel, color: "bg-blue-500", pct: (hotelTotal / grandTotal) * 100 },
    { label: "Food & Dining", value: foodTotal, icon: Utensils, color: "bg-orange-500", pct: (foodTotal / grandTotal) * 100 },
    { label: "Activities", value: activityTotal, icon: Ticket, color: "bg-violet-500", pct: (activityTotal / grandTotal) * 100 },
    { label: "Transport", value: transportTotal, icon: Compass, color: "bg-emerald-500", pct: (transportTotal / grandTotal) * 100 },
  ];

  const Counter = ({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border bg-secondary hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center transition-all active:scale-90"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-2xl sm:text-3xl font-display font-bold w-12 text-center tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border bg-secondary hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center transition-all active:scale-90"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px] animate-float-delay" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">Interactive Tool</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">
            Trip Budget{" "}
            <span className="gradient-text-animated">Estimator</span>
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">Estimate your trip cost in seconds. Adjust days, travelers, and style.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border bg-white dark:bg-slate-800/80 shadow-xl p-6 sm:p-8 space-y-8"
        >
          {/* Controls row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <Counter value={days} onChange={setDays} min={1} max={30} label="Days" />
            <Counter value={travelers} onChange={setTravelers} min={1} max={10} label="Travelers" />

            {/* Budget level */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">Style</span>
              <div className="flex gap-1 p-1 rounded-2xl bg-secondary border">
                {(["budget", "moderate", "luxury"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setBudgetLevel(level)}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all ${
                      budgetLevel === level
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Breakdown */}
          <div className="space-y-4">
            {breakdown.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className={`w-9 h-9 rounded-xl ${item.color}/10 flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color.replace("bg-", "text-")}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold tabular-nums">₹{item.value.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground">Estimated Total</div>
              <div className="text-2xl sm:text-3xl font-display font-bold text-primary tabular-nums">
                ₹{grandTotal.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                ₹{Math.round(grandTotal / days / travelers).toLocaleString("en-IN")} per person per day
              </div>
            </div>
            <Link href="/plan">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 magnetic-hover gap-2">
                <Plane className="w-4 h-4" /> Plan This Trip
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useDarkMode();
  const { user, isAdmin, logout, isLoading } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SafarixLogo size={34} />
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight">Safarix AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl border hover:bg-muted transition-colors" aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!isLoading && (user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline hidden sm:flex">
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <Link href="/my-trips" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Plane className="w-3.5 h-3.5" /> My Trips
                </Link>
                <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
                Log in
              </Link>
            ))}
            <Link href="/plan">
              <Button size="sm" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 gap-1.5 magnetic-hover">
                <Plane className="w-3.5 h-3.5" /> Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <HeroSection />

        {/* ─── Stats Bar ───────────────────────────────────────────────────── */}
        <section className="py-10 sm:py-16 border-y border-border/50 bg-gradient-to-r from-secondary/50 via-background to-secondary/50 relative">
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {STATS.map((stat, i) => (
                <StatItem key={stat.label} {...stat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
          {/* Animated background orbs */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-float-slow" />
            <div className="absolute bottom-10 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-[80px] animate-float-delay" />
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <span className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">How it works</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">
                From Dream to Plan in{" "}
                <span className="gradient-text-animated">4 Steps</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">No travel agents. No hours of research. Just tell our AI what you want.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {HOW_IT_WORKS.map(({ Icon, step, title, desc, color, bg }, i) => (
                <motion.div
                  key={step}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative text-center group"
                >
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-2.5rem)] h-px border-t-2 border-dashed border-primary/20" />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300`}
                  >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${color}`} />
                  </motion.div>
                  <div className="text-[10px] sm:text-xs font-bold text-primary/60 tracking-widest mb-1">STEP {step}</div>
                  <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{title}</h3>
                  <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ──────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 bg-secondary/30 relative overflow-hidden">
          {/* Ambient background blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-500/8 rounded-full blur-[100px]" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <span className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">Features</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">
                Everything For The{" "}
                <span className="gradient-text-animated">Perfect Trip</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">We handle the research so you can focus on the experience.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FEATURES.map(({ Icon, title, description, bg, iconBg, iconColor, borderHover }, i) => (
                <motion.div
                  key={title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                >
                  <Card className={`border shadow-lg shine-hover h-full ${bg} ${borderHover} transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 group`}>
                    <CardContent className="pt-6 pb-6 relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.12, rotate: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                      </motion.div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
          {/* Ambient background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[150px]" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <span className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">
                Loved by{" "}
                <span className="gradient-text-animated">Travelers</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground">Real trips, real experiences, real savings.</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {TESTIMONIALS.map(({ name, role, initials, rating, text, dest, gradFrom, gradTo }, i) => (
                <motion.div
                  key={name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                >
                  <Card className="border shadow-lg h-full bg-white dark:bg-slate-800/80 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    {/* Colored top stripe with glow */}
                    <div className={`h-1.5 bg-gradient-to-r ${gradFrom} ${gradTo} group-hover:h-2.5 transition-all duration-300`} />
                    <CardContent className="pt-5 relative">
                      {/* Quote icon */}
                      <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                        <Quote className="w-14 h-14 sm:w-16 sm:h-16" />
                      </div>
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3 sm:mb-4">
                        {[...Array(rating)].map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-5 italic relative z-10">"{text}"</p>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm">{name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {role}
                            <span className="mx-0.5 sm:mx-1">·</span>
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {dest}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Popular Destinations ─────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Premium ambient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] animate-float-slow" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[120px] animate-float-delay" />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[100px]" />
          </div>
          <div className="max-w-[1400px] mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <span className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">Popular Destinations</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mt-3 mb-4">
                Where Will You Go{" "}
                <span className="gradient-text-animated">Next?</span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">Trending destinations our travelers love. Click any to start planning instantly.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {DESTINATIONS.map((dest, i) => (
                <motion.div
                  key={dest.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/plan?dest=${encodeURIComponent(dest.name + ", " + dest.country)}&days=${parseInt(dest.days)}&auto=true`)}
                >
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl aspect-[3/4] shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-white/10">
                    {/* Image */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

                    {/* Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10 shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {dest.tag}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="font-display font-bold text-lg sm:text-2xl text-white mb-1" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{dest.name}</h3>
                      <p className="text-white/80 text-xs sm:text-sm flex items-center gap-1 mb-3" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                        <MapPin className="w-3 h-3" /> {dest.country}
                      </p>

                      {/* Details row — slides up on hover */}
                      <div className="flex items-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <div className="flex items-center gap-1 text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                          <Clock className="w-3 h-3" /> {dest.days} days
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                          <IndianRupee className="w-3 h-3" /> {dest.budget}
                        </div>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 border border-white/20">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Trip Budget Estimator ──────────────────────────────────────── */}
        <BudgetEstimator />

        {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center aurora-bg rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
          >
            {/* Mesh rings */}
            {[100, 180, 260].map((size, i) => (
              <motion.div
                key={i}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 25 + i * 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
                style={{ width: size, height: size }}
              />
            ))}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-sm" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-sm" />
            {["top-4 left-6", "bottom-6 right-6"].map((pos, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                className={`absolute ${pos} hidden sm:block`}
              >
                <Sparkles className="w-3.5 h-3.5 text-white/25" />
              </motion.div>
            ))}

            <div className="relative z-10 space-y-4 sm:space-y-5">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto border border-white/25 shadow-lg shadow-white/10"
              >
                <Plane className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white">
                  Ready to Explore?
                </h2>
                <p className="text-white/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Join <strong className="text-white font-bold">50,000+</strong> travelers who've planned stress-free trips with Safarix AI. It's completely free.
                </p>
              </div>



              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                <Link href="/plan">
                  <Button size="default" variant="secondary" className="rounded-full px-6 sm:px-8 h-10 sm:h-11 text-sm w-full sm:w-auto font-bold magnetic-hover transition-all shadow-xl gap-2 hover:-translate-y-0.5">
                    <Zap className="w-4 h-4" /> Start Planning Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="default" variant="outline" className="rounded-full px-6 sm:px-8 h-10 sm:h-11 text-sm w-full sm:w-auto font-medium border-white/50 text-white hover:bg-white/15 hover:text-white hover:border-white magnetic-hover transition-all gap-2 hover:-translate-y-0.5">
                    <Lock className="w-4 h-4" /> Create Free Account
                  </Button>
                </Link>
              </div>

              <p className="text-white/45 text-[10px] sm:text-xs flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" /> No credit card required · Free forever
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-900 border-t py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:gap-6 text-center md:text-left md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <SafarixLogo size={28} />
              <span className="font-display font-bold text-lg">Safarix AI</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <Link href="/plan" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Plane className="w-3.5 h-3.5" /> Plan a Trip
              </Link>
              <Link href="/login" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Lock className="w-3.5 h-3.5" /> Sign In
              </Link>
              {user && (
                <Link href="/my-trips" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <MapPin className="w-3.5 h-3.5" /> My Trips
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              © {new Date().getFullYear()} Safarix AI · Crafted for travelers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
