import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, X, MapPin, Clock, IndianRupee,
  Building2, ChevronDown, Plane, Waves, Mountain, Compass,
  TreePalm, Backpack, Hotel, Utensils, Activity, Wallet
} from "lucide-react";

// ─── Sample itinerary data ────────────────────────────────────────────────────
const SAMPLE = {
  destination: "Goa, India",
  days: 4,
  budget: "Medium",
  travelers: "Couple",
  itinerary: [
    {
      day: 1, theme: "Arrival & North Goa Exploration",
      activities: [
        { time: "10:00 AM", title: "Baga Beach", description: "Soak in the golden sands of one of Goa's most vibrant beaches. Rent recliners and enjoy the sea breeze.", cost: "₹200 – ₹400", tip: "Visit on weekdays to avoid weekend crowds." },
        { time: "1:00 PM", title: "Anjuna Flea Market", description: "Browse authentic Goan souvenirs, textiles, and handicrafts. Great place to pick up local art.", cost: "Free entry", tip: "Bargain hard — start at 40% of asking price." },
        { time: "4:00 PM", title: "Chapora Fort", description: "A 17th-century fort with sweeping views over the Arabian Sea and Chapora River. Famous from Dil Chahta Hai.", cost: "Free", tip: "Go in the last hour before sunset for best light." },
        { time: "7:30 PM", title: "Thalassa Greek Restaurant", description: "Stunning hilltop restaurant blending Goan hospitality with Mediterranean cuisine and sea views.", cost: "₹1,500 – ₹2,500/person", tip: "Reserve a window table at least 3 days in advance." },
      ],
    },
    {
      day: 2, theme: "Heritage & Old Goa",
      activities: [
        { time: "9:00 AM", title: "Basilica of Bom Jesus", description: "UNESCO World Heritage Site housing remains of St. Francis Xavier. Baroque architecture at its finest.", cost: "Free", tip: "Go early to avoid tour groups." },
        { time: "11:30 AM", title: "Se Cathedral", description: "One of Asia's largest churches, built in Portuguese Gothic style. The Golden Bell is a must-see.", cost: "Free", tip: "Opens 9 AM, closes for lunch at noon." },
        { time: "2:30 PM", title: "Dudhsagar Waterfalls", description: "India's 5th tallest waterfall at 310m in a stunning 4-tiered cascade.", cost: "₹150 + jeep ₹400", tip: "Best visited July–December when water flow peaks." },
        { time: "7:00 PM", title: "Panjim Latin Quarter", description: "Stroll through Fontainhas, Goa's heritage quarter with colorful Portuguese-era mansions.", cost: "Free", tip: "Look for Café Bodega on Altinho Hill for great views." },
      ],
    },
  ],
  hotels: [
    { name: "The Leela Goa", price: "₹12,000/night", stars: 5, note: "Beachfront resort, multiple pools" },
    { name: "Taj Holiday Village", price: "₹8,500/night", stars: 4, note: "Calangute, ideal for couples" },
  ],
  costs: {
    accommodation: "₹8,500 – ₹12,000/night",
    food: "₹1,200 – ₹2,500/day",
    activities: "₹500 – ₹1,500/day",
    total: "₹45,000 – ₹80,000 (4 days, couple)",
  },
};

// ─── Floating icon particles ──────────────────────────────────────────────────
const PARTICLES = [
  { Icon: Plane, x: "8%", top: "18%", delay: 0, dur: 8, rot: -30 },
  { Icon: Waves, x: "22%", top: "55%", delay: 2, dur: 10, rot: 0 },
  { Icon: Compass, x: "42%", top: "12%", delay: 1, dur: 7, rot: 15 },
  { Icon: Mountain, x: "63%", top: "60%", delay: 3, dur: 9, rot: -10 },
  { Icon: TreePalm, x: "80%", top: "20%", delay: 0.5, dur: 11, rot: 5 },
  { Icon: Backpack, x: "92%", top: "50%", delay: 2.5, dur: 8, rot: -20 },
];

function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map(({ Icon, x, top, delay, dur, rot }, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: x, top,
            animation: `particle-float ${dur}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 flex items-center justify-center shadow-lg"
            style={{ transform: `rotate(${rot}deg)` }}
          >
            <Icon className="w-5 h-5 text-primary/40" strokeWidth={1.5} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cost icon map ────────────────────────────────────────────────────────────
const COST_ITEMS = [
  { label: "Hotel", key: "accommodation", Icon: Hotel, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Food", key: "food", Icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Activities", key: "activities", Icon: Activity, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Total", key: "total", Icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

// ─── Sample Itinerary Modal ───────────────────────────────────────────────────
function SampleModal({ onClose }: { onClose: () => void }) {
  const [openDay, setOpenDay] = useState(0);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="modal-content bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header */}
        <div className="relative h-44 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 rounded-t-3xl flex items-end p-6 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80" className="w-full h-full object-cover opacity-25" alt="Goa" />
            {/* Animated rings */}
            <div className="absolute top-4 right-8 w-24 h-24 rounded-full border border-white/20 animate-pulse" />
            <div className="absolute top-8 right-4 w-36 h-36 rounded-full border border-white/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                {SAMPLE.days} Days · {SAMPLE.travelers} · {SAMPLE.budget} Budget
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h2 className="text-2xl font-bold">{SAMPLE.destination}</h2>
            </div>
            <p className="text-white/70 text-sm mt-0.5">Sample AI-generated itinerary</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cost grid */}
          <div className="grid grid-cols-2 gap-3">
            {COST_ITEMS.map(({ label, key, Icon, color, bg }) => (
              <div key={key} className="rounded-2xl p-4 border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-xl ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                </div>
                <p className="font-bold text-sm text-foreground">{SAMPLE.costs[key as keyof typeof SAMPLE.costs]}</p>
              </div>
            ))}
          </div>

          {/* Hotels */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-sm">Recommended Hotels</h3>
            </div>
            <div className="space-y-2">
              {SAMPLE.hotels.map(h => (
                <div key={h.name} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border dark:border-slate-700 hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-bold text-sm">{h.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex">
                        {[...Array(h.stars)].map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-sm bg-amber-400 mr-0.5" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{h.note}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">{h.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Itinerary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-sm">Daily Itinerary</h3>
            </div>
            <div className="space-y-2">
              {SAMPLE.itinerary.map((day, di) => (
                <div key={di} className="border dark:border-slate-700 rounded-2xl overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    onClick={() => setOpenDay(openDay === di ? -1 : di)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center">{day.day}</div>
                      <span className="font-semibold text-sm">{day.theme}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${openDay === di ? "rotate-180" : ""}`} />
                  </button>
                  {openDay === di && (
                    <div className="p-4 space-y-4 border-t dark:border-slate-700">
                      {day.activities.map((act, ai) => (
                        <div key={ai} className="flex gap-3">
                          <div className="shrink-0">
                            <div className="flex items-center gap-1 text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-lg">
                              <Clock className="w-3 h-3" /> {act.time}
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{act.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{act.description}</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                              {act.cost && (
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium flex items-center gap-1">
                                  <IndianRupee className="w-2.5 h-2.5" /> {act.cost.replace(/^₹\s*/i, "")}
                                </span>
                              )}
                              {act.tip && (
                                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> {act.tip}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link href="/plan">
            <Button
              onClick={onClose}
              className="w-full h-12 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all magnetic-hover"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Own Itinerary
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  { destination: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2070&auto=format&fit=crop" },
  { destination: "Makkah", country: "Saudi Arabia", image: "/images/makkah.jpg" },
  { destination: "Madinah", country: "Saudi Arabia", image: "/images/madinah.jpg" },
  { destination: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop" },
  { destination: "Swiss Alps", country: "Switzerland", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop" },
  { destination: "Machu Picchu", country: "Peru", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop" },
  { destination: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop" },
  { destination: "Maldives", country: "Indian Ocean", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2065&auto=format&fit=crop" },
  { destination: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop" },
  { destination: "Kyoto", country: "Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop" },
];

const SLIDE_DURATION = 5000;

export function HeroSection() {
  const [showSample, setShowSample] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // Preload the next image for instant transition
  const nextImageIndex = (currentImageIndex + 1) % HERO_SLIDES.length;
  useEffect(() => {
    const img = new Image();
    img.src = HERO_SLIDES[nextImageIndex].image;
    preloadRef.current = img;
  }, [nextImageIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_SLIDES.length);
      setProgress(0);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const step = 50; // ms
    const inc = (step / SLIDE_DURATION) * 100;
    const id = setInterval(() => setProgress((p) => Math.min(p + inc, 100)), step);
    return () => clearInterval(id);
  }, [currentImageIndex]);

  return (
    <>
      <AnimatePresence>
        {showSample && <SampleModal onClose={() => setShowSample(false)} />}
      </AnimatePresence>

      <div className="relative overflow-hidden bg-background pt-8 pb-16 sm:pt-12 sm:pb-28 md:pt-20 md:pb-36 mesh-gradient noise-overlay">
        {/* Grid pattern background */}
        <div className="bg-grid-pattern" />

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-10 -left-20 w-96 h-96 bg-primary/20 dark:bg-primary/25 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute top-32 right-0 w-80 h-80 bg-blue-500/20 dark:bg-cyan-500/25 rounded-full blur-[100px] animate-float-delay" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-500/15 dark:bg-purple-500/25 rounded-full blur-[100px] animate-float" />
        </div>

        {/* Lucide icon particles */}
        <Particles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-8 border border-primary/20 animate-pulse-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Travel Planning · Precise Itineraries</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-4 sm:mb-6 leading-[1.1]"
          >
            Plan Your Dream Trip
            <br />
            <span className="text-shimmer">
              In 20 Seconds
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-base md:text-xl text-muted-foreground mb-6 sm:mb-10 text-balance leading-relaxed px-2 sm:px-0"
          >
            Stop spending hours researching. Our AI builds a complete day-by-day itinerary with real costs, top hotels, local food spots, and hidden gems — tailored to <em>you</em>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0"
          >
            <Link href="/plan">
              <Button
                size="lg"
                className="rounded-full px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg w-full sm:w-auto shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all magnetic-hover active:scale-95 font-bold gap-2"
              >
                <Plane className="w-5 h-5" />
                Start Planning Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg w-full sm:w-auto border-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all magnetic-hover active:scale-95 font-medium gap-2"
              onClick={() => setShowSample(true)}
            >
              <Compass className="w-5 h-5" />
              View Sample Itinerary
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 sm:mt-10 flex items-center justify-center gap-4 sm:gap-8"
          >
            {[
              { val: "50K+", label: "Trips Planned", Icon: MapPin },
              { val: "4.9★", label: "User Rating", Icon: Sparkles },
              { val: "Free", label: "Always", Icon: Wallet },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <s.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="font-bold text-foreground text-sm sm:text-lg">{s.val}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="mt-10 sm:mt-16 md:mt-24 relative max-w-5xl mx-auto z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Ambient Background Glow matching the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-blue-500/20 to-purple-500/30 blur-[80px] -z-10 rounded-full animate-pulse-glow" style={{ animationDuration: '4s' }} />

            <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-2 sm:border-4 border-white/60 dark:border-slate-800/80 ring-1 ring-black/10 aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] w-full bg-slate-100 dark:bg-slate-900">
              <AnimatePresence mode="sync">
                <motion.img
                  key={currentImageIndex}
                  src={HERO_SLIDES[currentImageIndex].image}
                  alt={HERO_SLIDES[currentImageIndex].destination}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1, transition: { opacity: { duration: 1.2, ease: "easeOut" }, scale: { duration: SLIDE_DURATION / 1000, ease: "linear" } } }}
                  exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ willChange: "opacity, transform" }}
                />
              </AnimatePresence>

              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/15 pointer-events-none" />

              {/* Destination label — bottom-left inside image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute bottom-10 sm:bottom-14 right-3 sm:right-5 md:right-8 z-20"
                >
                  <div className="bg-black/50 backdrop-blur-xl rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-right">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-[9px] sm:text-[11px] font-semibold text-white/80 uppercase tracking-widest">{HERO_SLIDES[currentImageIndex].country}</span>
                    </div>
                    <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-display font-bold text-white whitespace-nowrap" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{HERO_SLIDES[currentImageIndex].destination}</h3>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slide indicators */}
              <div className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 md:right-8 flex items-center gap-1 sm:gap-1.5 z-20">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentImageIndex(i); setProgress(0); }}
                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${i === currentImageIndex ? "w-5 sm:w-7 bg-white" : "w-1.5 sm:w-2.5 bg-white/40 hover:bg-white/60"}`}
                  >
                    {i === currentImageIndex && (
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%`, transition: "width 50ms linear" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating badge — Budget */}
            <motion.div
              animate={{ y: [0, -12, 0], x: [0, -4, 0], rotate: [-1, 1.5, -1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 left-2 sm:-bottom-8 sm:-left-4 md:bottom-8 md:-left-12 bg-white/90 backdrop-blur-xl dark:bg-slate-900/90 p-2.5 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-2 sm:gap-4 hover:scale-[1.03] hover:shadow-emerald-500/20 transition-all duration-300 group z-20"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 ease-out border border-emerald-200/50 dark:border-emerald-500/20">
                <IndianRupee className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-base dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">Budget Optimized</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 hidden sm:block">Real INR cost estimates</p>
              </div>
            </motion.div>

            {/* Floating badge — Itinerary */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 4, 0], rotate: [1, -1.5, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-6 right-2 sm:-top-8 sm:-right-4 md:top-12 md:-right-12 bg-white/90 backdrop-blur-xl dark:bg-slate-900/90 p-2.5 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-2 sm:gap-4 hover:scale-[1.03] hover:shadow-blue-500/20 transition-all duration-300 group z-20"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-400/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300 ease-out border border-blue-200/50 dark:border-blue-500/20">
                <Compass className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-base dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">AI Itinerary</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 hidden sm:block">Day-by-day, hour-by-hour</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
