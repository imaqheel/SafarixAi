import { useParams, Link } from "wouter";
import { useTrip } from "@/hooks/use-trips";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Calendar, Users, IndianRupee,
  Share2, Printer, ArrowLeft, Hotel, Star,
  Clock, Lightbulb, Camera, Landmark, Leaf, ShoppingBag,
  Church, Mountain, Moon, Sun, Bus, Utensils, Activity, ClipboardList,
  Wallet, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef, useMemo, Component, ReactNode } from "react";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-red-500 p-10 font-mono text-sm overflow-auto">
          <h1 className="text-2xl text-white mb-4">CRASH DETECTED</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap mt-4 text-slate-400">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useToast } from "@/hooks/use-toast";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { TripMap } from "@/components/trip-map";
import { generateCalendarICS } from "@/lib/calendar-export";
import { TripWeather } from "@/components/trip-weather";
import { TripPrayerTimes } from "@/components/trip-prayer-times";
import { generatePDF } from "@/lib/pdf-export";
import { CalendarDays, Download, ArrowRight } from "lucide-react";
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Placeholder when no image is available ──────────────────────────────────
function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 gap-2">
      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 dark:text-slate-600" />
      {label && (
        <span className="text-[10px] sm:text-xs text-slate-400 font-medium text-center px-2 line-clamp-1">
          {label}
        </span>
      )}
    </div>
  );
}

// ─── Image fetch: Wikipedia Article Image → Wikimedia Commons ───
// Filters out old paintings, engravings, and low-quality results
const IMAGE_BLACKLIST = ["map", "logo", "flag", "coat_of_arms", "icon", "seal_of", "diagram", "chart"];
const FOOD_KEYWORDS = ["restaurant", "cafe", "bistro", "breakfast", "lunch", "dinner", "brasserie", "tavern", "eatery", "steakhouse", "pizzeria", "bakery", "deli", "food"];

// Breakfast-specific images (coffee, pancakes, eggs, pastries)
const BREAKFAST_FALLBACKS = [
  "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800&auto=format&fit=crop",
];

// Lunch-specific images (casual dining, bowls, salads)
const LUNCH_FALLBACKS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop",
];

// Dinner-specific images (fine dining, candlelit, elegant)
const DINNER_FALLBACKS = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
];

const FOOD_FALLBACKS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop"
];

// Mosque/Masjid keywords for detection
const MOSQUE_KEYWORDS = ["mosque", "masjid", "jama", "jami", "prayer time", "prayer –", "prayer-", "namaz", "salah", "musalla"];

// Morning/daytime masjid (golden warm tones — used for Fajr, Dhuhr, Asr)
const MASJID_MORNING_IMAGE = "/images/masjid/morning.jpg";
// Night/evening masjid (blue cool tones — used for Maghrib, Isha and default)
const MASJID_NIGHT_IMAGE = "/images/masjid/night.jpg";

// Determine if a given activity time string represents nighttime (for Maghrib/Isha)
function isNighttimePrayer(activityTime?: string): boolean {
  if (!activityTime) return false;
  const timeLower = activityTime.toLowerCase();
  // Explicit prayer name checks
  if (timeLower.includes("maghrib") || timeLower.includes("isha")) return true;
  // Parse numeric hour: anything >= 5 PM is night
  const hourMatch = timeLower.match(/(\d{1,2})/);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1]);
    if (timeLower.includes("pm") && hour !== 12) hour += 12;
    if (timeLower.includes("am") && hour === 12) hour = 0;
    return hour >= 17; // 5 PM+
  }
  return false;
}

async function fetchBestImage(placeName: string, cityName?: string, mealType?: string, activityTime?: string): Promise<string | null> {
  const nameLower = placeName.toLowerCase();
  const isFood = FOOD_KEYWORDS.some(k => nameLower.includes(k));
  const isMosque = mealType === "prayer" || MOSQUE_KEYWORDS.some(k => nameLower.includes(k));
  const hash = placeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const query = cityName ? `${placeName} ${cityName}` : placeName;
  const encodedQuery = encodeURIComponent(query);
  const encodedPlace = encodeURIComponent(placeName);

  // 1. Try Wikipedia full-text search first
  try {
    const searchResp = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&srlimit=4&utf8=&format=json&origin=*`
    ).then((r) => r.json());
    
    const searchResults = searchResp?.query?.search ?? [];
    if (searchResults.length > 0) {
      const titles = searchResults.map((s: any) => s.title).join("|");
      const imgResp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=800&pilicense=any&format=json&origin=*`
      ).then((r) => r.json());
      
      const pages = Object.values(imgResp?.query?.pages ?? {}) as any[];
      for (const res of searchResults) {
        // Strict anti-mismatch rule: If the article returned is literally just the city name, 
        // it means Wikipedia couldn't find the restaurant/spot and just matched the city. Reject it.
        if (cityName && res.title.toLowerCase() === cityName.toLowerCase()) continue;
        
        const page = pages.find((p) => p.title === res.title);
        const src = page?.thumbnail?.source;
        if (src && !src.toLowerCase().includes(".svg") && !IMAGE_BLACKLIST.some(b => src.toLowerCase().includes(b))) {
          return src;
        }
      }
    }
  } catch { /* continue */ }

  // 2. Try Wikipedia search with JUST the place name if city name failed to match
  if (cityName) {
    try {
      const searchResp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedPlace}&srlimit=3&utf8=&format=json&origin=*`
      ).then((r) => r.json());
      
      const searchResults = searchResp?.query?.search ?? [];
      if (searchResults.length > 0) {
        const titles = searchResults.map((s: any) => s.title).join("|");
        const imgResp = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=800&pilicense=any&format=json&origin=*`
        ).then((r) => r.json());
        
        const pages = Object.values(imgResp?.query?.pages ?? {}) as any[];
        for (const res of searchResults) {
          if (cityName && res.title.toLowerCase() === cityName.toLowerCase()) continue;
          const page = pages.find((p) => p.title === res.title);
          const src = page?.thumbnail?.source;
          if (src && !src.toLowerCase().includes(".svg") && !IMAGE_BLACKLIST.some(b => src.toLowerCase().includes(b))) {
            return src;
          }
        }
      }
    } catch { /* continue */ }
  }

  // 3. Fallback to Wikimedia Commons strictly matching the place name in the title
  try {
    const data = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=intitle:"${encodedPlace}"&gsrlimit=3&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&origin=*`
    ).then((r) => r.json());
    
    const pages = Object.values(data?.query?.pages ?? {}) as any[];
    for (const p of pages) {
      const url = p?.imageinfo?.[0]?.thumburl ?? "";
      const urlLower = url.toLowerCase();
      if (url && !urlLower.includes(".svg") && !IMAGE_BLACKLIST.some(b => urlLower.includes(b))) {
        return url;
      }
    }
  } catch { /* continue */ }

  // 4. Mosque/Masjid fallback if mosque
  if (isMosque) {
    const titleAndTime = `${nameLower} ${(activityTime ?? "").toLowerCase()}`;
    const isNight = titleAndTime.includes("maghrib") || titleAndTime.includes("isha") || isNighttimePrayer(activityTime);
    return isNight ? MASJID_NIGHT_IMAGE : MASJID_MORNING_IMAGE;
  }

  // 5. Use meal-type-specific static images IF API returned nothing
  if (mealType === "breakfast" || (!mealType && !isMosque && (nameLower.includes("breakfast") || nameLower.includes("brunch")))) {
    return BREAKFAST_FALLBACKS[hash % BREAKFAST_FALLBACKS.length];
  }
  if (mealType === "lunch" || (!mealType && !isMosque && nameLower.includes("lunch"))) {
    return LUNCH_FALLBACKS[hash % LUNCH_FALLBACKS.length];
  }
  if (mealType === "dinner" || (!mealType && !isMosque && (nameLower.includes("dinner") || nameLower.includes("supper")))) {
    return DINNER_FALLBACKS[hash % DINNER_FALLBACKS.length];
  }
  if (isFood && !isMosque) {
    return FOOD_FALLBACKS[hash % FOOD_FALLBACKS.length];
  }

  // 6. Curated fallback: pick a unique, relevant photo based on the activity type/name
  const LANDMARK_IMAGES = [
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543832923-44667a44c804?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520939817895-060bdaf68bc4?q=80&w=800&auto=format&fit=crop",
  ];
  const NATURE_IMAGES = [
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57?q=80&w=800&auto=format&fit=crop",
  ];
  const MARKET_IMAGES = [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1573812195421-50a396d17893?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528698827591-e19cef51a992?q=80&w=800&auto=format&fit=crop",
  ];
  const MUSEUM_IMAGES = [
    "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605130284535-11983da3255f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580761043855-3bc4c7118efd?q=80&w=800&auto=format&fit=crop",
  ];
  const GENERIC_TRAVEL = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502301103665-0b95cc738daf?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504150558240-0b4fd8946624?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528127269322-539152a5c356?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501446529957-6226bd447c46?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=800&auto=format&fit=crop",
  ];

  // Pick category by keywords in the place name
  const hasKeyword = (kws: string[]) => kws.some(k => nameLower.includes(k));
  let pool: string[];
  if (hasKeyword(["park", "garden", "beach", "lake", "hill", "waterfall", "forest", "valley", "mountain", "trail", "river", "coast"])) {
    pool = NATURE_IMAGES;
  } else if (hasKeyword(["market", "bazaar", "shopping", "mall", "souk", "street"])) {
    pool = MARKET_IMAGES;
  } else if (hasKeyword(["museum", "gallery", "art", "exhibit", "palace"])) {
    pool = MUSEUM_IMAGES;
  } else if (hasKeyword(["fort", "tower", "gate", "bridge", "monument", "statue", "castle", "temple", "cathedral", "mosque"])) {
    pool = LANDMARK_IMAGES;
  } else {
    // If it's a sacred/Islamic site, use a sacred picture.
    const cityLower = cityName?.toLowerCase() ?? "";
    if (["makkah", "mecca", "madinah", "medina", "kaaba", "haram", "nabawi", "umrah", "hajj", "islamic"].some(k => nameLower.includes(k) || cityLower.includes(k))) {
      pool = [
        "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1594881497142-08fdfdfc4074?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=800&auto=format&fit=crop"
      ];
    } else if (["riyadh", "saudi", "dubai", "uae", "desert", "arab", "qatar", "oman", "egypt"].some(k => nameLower.includes(k) || cityLower.includes(k))) {
      pool = [
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571104508999-893933eff226?q=80&w=800&auto=format&fit=crop"
      ];
    } else {
      pool = GENERIC_TRAVEL;
    }
  }

  return pool[hash % pool.length];
}

// ─── PlaceImage component ────────────────────────────────────────────────────
function PlaceImage({ placeName, cityName, className, mealType, activityTime, presetImage }: { placeName: string; cityName?: string; className?: string; mealType?: string; activityTime?: string; presetImage?: string }) {
  const [src, setSrc] = useState<string | null>(presetImage || null);
  const [loaded, setLoaded] = useState(false);
  const [fetchDone, setFetchDone] = useState(!!presetImage);
  const hasFetched = useRef(!!presetImage);

  useEffect(() => {
    if (!placeName || hasFetched.current) return;
    hasFetched.current = true;
    fetchBestImage(placeName, cityName, mealType, activityTime).then((url) => { setSrc(url); setFetchDone(true); });
  }, [placeName, cityName, mealType, activityTime]);

  if (fetchDone && !src) return <ImagePlaceholder label={placeName} />;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 dark:bg-slate-800">
      {/* Animated skeleton shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-5 h-5 text-slate-300 dark:text-slate-600 animate-pulse" />
          </div>
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={placeName}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} ${className ?? ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setSrc(null); setFetchDone(true); }}
        />
      )}
    </div>
  );
}

// ─── Hero image: Wikipedia city article thumbnail ────────────────────────────
async function fetchHeroImage(destination: string): Promise<string | null> {
  const city = destination.split(",")[0].trim();
  const country = destination.split(",").pop()?.trim() ?? "";
  const queries = [
    city,
    `${city}, ${country}`.trim(),
    `${city} district`,
    `${city} city`,
  ].filter((q, i, arr) => arr.indexOf(q) === i);

  for (const q of queries) {
    try {
      const openSearch = await fetch(
        `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=3&namespace=0&format=json&origin=*`
      ).then((r) => r.json());
      const titles: string[] = openSearch?.[1] ?? [];
      const best = titles.find((t) => t.toLowerCase().startsWith(city.toLowerCase())) ?? titles[0];
      if (!best) continue;
      const pageRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(best)}&prop=pageimages&pithumbsize=1400&pilicense=any&format=json&origin=*`
      ).then((r) => r.json());
      const page = Object.values(pageRes?.query?.pages ?? {})[0] as any;
      const imgSrc: string | undefined = page?.thumbnail?.source;
      if (imgSrc && !imgSrc.toLowerCase().includes(".svg")) return imgSrc;
    } catch { /* try next */ }
  }
  return null;
}

function getHeroFallback(destination: string): string {
  const destLower = destination.toLowerCase();
  const hash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Sacred / Islamic Cities
  if (["makkah", "mecca", "madinah", "medina", "kaaba", "haram", "nabawi", "umrah", "hajj"].some(k => destLower.includes(k))) {
    const SACRED = [
      "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=2070&auto=format&fit=crop", // Beautiful mosque
      "https://images.unsplash.com/photo-1551041777-ed277b8dd348?q=80&w=2070&auto=format&fit=crop", // Mosque night
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2070&auto=format&fit=crop", // Islamic architecture
      "https://images.unsplash.com/photo-1594881497142-08fdfdfc4074?q=80&w=2070&auto=format&fit=crop", // Islamic geometric art
    ];
    return SACRED[hash % SACRED.length];
  }

  // Desert, Middle East, Arab regions
  if (["riyadh", "saudi", "dubai", "uae", "desert", "arab", "qatar", "oman", "egypt", "morocco", "cairo"].some(k => destLower.includes(k))) {
    const DESERT = [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop", // Dubai skyline
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop", // Desert dunes
      "https://images.unsplash.com/photo-1571104508999-893933eff226?q=80&w=2070&auto=format&fit=crop", // Middle east architecture
    ];
    return DESERT[hash % DESERT.length];
  }

  // Beaches, Tropical, Islands
  if (["beach", "island", "maldives", "bali", "hawaii", "bahamas", "phuket", "coast", "goa", "caribbean"].some(k => destLower.includes(k))) {
    const TROPICAL = [
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2070&auto=format&fit=crop", // Beach
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop", // Beach house
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop", // Tropical beach sunset
    ];
    return TROPICAL[hash % TROPICAL.length];
  }

  // Winter, Snow, Skiing
  if (["snow", "ski", "alps", "winter", "iceland", "norway", "switzerland", "himalaya"].some(k => destLower.includes(k))) {
    const SNOW = [
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2070&auto=format&fit=crop", // Snowy mountains
      "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=2070&auto=format&fit=crop", // Winter landscape
      "https://images.unsplash.com/photo-1517298257259-f72ccd2bd3ce?q=80&w=2070&auto=format&fit=crop", // snowy tree
    ];
    return SNOW[hash % SNOW.length];
  }

  // Nature, Parks, Lakes
  if (["mount", "valley", "lake", "park", "forest", "nature"].some(k => destLower.includes(k))) {
    const NATURE = [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop", // Mountain lake boat (the classic)
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop", // Mountains
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop", // Beautiful lake
    ];
    return NATURE[hash % NATURE.length];
  }

  // Default: Diverse Metropolitan Cities & Beautiful Travel
  const CITIES = [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1444723121867-b5074f762740?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1446776811953-b23d5732155f?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=2070&auto=format&fit=crop",
  ];
  return CITIES[hash % CITIES.length];
}

function HeroImage({ destination }: { destination: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failedWaitFallback, setFailedWaitFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fallbackUrl = useMemo(() => getHeroFallback(destination), [destination]);

  useEffect(() => {
    if (!destination) return;
    setLoaded(false);
    setFailedWaitFallback(false);
    setHasError(false);
    
    let isCancelled = false;
    fetchHeroImage(destination).then((url) => {
      if (isCancelled) return;
      if (url) {
        setSrc(url);
      } else {
        setSrc(fallbackUrl);
        setFailedWaitFallback(true);
      }
    });
    
    return () => { isCancelled = true; };
  }, [destination, fallbackUrl]);

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-100 transition-opacity duration-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <Camera className="w-16 h-16 text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-slate-800/80" />}
      <img
        src={src || fallbackUrl}
        alt={destination}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => { 
          if (!failedWaitFallback) {
            setSrc(fallbackUrl);
            setFailedWaitFallback(true);
          } else {
            setHasError(true);
          }
        }}
      />
    </>
  );
}

// ─── Category icon for tourist spots ────────────────────────────────────────
function SpotCategoryIcon({ category }: { category: string }) {
  const cat = (category ?? "").toLowerCase();
  if (cat.includes("histor") || cat.includes("heritage")) return <Landmark className="w-3.5 h-3.5" />;
  if (cat.includes("nature") || cat.includes("park") || cat.includes("garden")) return <Leaf className="w-3.5 h-3.5" />;
  if (cat.includes("religious") || cat.includes("temple") || cat.includes("church")) return <Church className="w-3.5 h-3.5" />;
  if (cat.includes("beach") || cat.includes("coast")) return <Mountain className="w-3.5 h-3.5" />;
  if (cat.includes("shopping") || cat.includes("market")) return <ShoppingBag className="w-3.5 h-3.5" />;
  return <Camera className="w-3.5 h-3.5" />;
}

// ── Meal type badge & styling utilities ──────────────────────────────────────
const MEAL_CONFIG: Record<string, { label: string; icon: React.ReactNode; badgeClass: string; borderClass: string; bgClass: string }> = {
  breakfast: {
    label: "Breakfast",
    icon: <Sun className="w-3 h-3" />,
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    borderClass: "border-l-amber-400 dark:border-l-amber-500",
    bgClass: "bg-amber-50/50 dark:bg-amber-950/20",
  },
  lunch: {
    label: "Lunch",
    icon: <Utensils className="w-3 h-3" />,
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    borderClass: "border-l-emerald-400 dark:border-l-emerald-500",
    bgClass: "bg-emerald-50/50 dark:bg-emerald-950/20",
  },
  dinner: {
    label: "Dinner",
    icon: <Moon className="w-3 h-3" />,
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    borderClass: "border-l-violet-400 dark:border-l-violet-500",
    bgClass: "bg-violet-50/50 dark:bg-violet-950/20",
  },
  attraction: {
    label: "Attraction",
    icon: <Camera className="w-3 h-3" />,
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    borderClass: "",
    bgClass: "",
  },
  prayer: {
    label: "Prayer",
    icon: <Church className="w-3 h-3" />,
    badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    borderClass: "border-l-teal-400 dark:border-l-teal-500",
    bgClass: "bg-teal-50/50 dark:bg-teal-950/20",
  },
};

function getMealType(act: any): string {
  if (act.type) return act.type.toLowerCase();
  const title = (act.title ?? "").toLowerCase();
  if (title.includes("breakfast") || title.includes("brunch")) return "breakfast";
  if (title.includes("lunch")) return "lunch";
  if (title.includes("dinner") || title.includes("supper")) return "dinner";
  if (title.includes("prayer") || title.includes("masjid")) return "prayer";
  return "attraction";
}

function MealTypeBadge({ type }: { type: string }) {
  const config = MEAL_CONFIG[type] ?? MEAL_CONFIG.attraction;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// ── Daily summary bar ────────────────────────────────────────────────────────
function DaySummaryBar({ activities }: { activities: any[] }) {
  const meals = activities.filter((a: any) => ["breakfast", "lunch", "dinner"].includes(getMealType(a))).length;
  const attractions = activities.filter((a: any) => getMealType(a) === "attraction").length;
  const totalCost = activities.reduce((sum: number, a: any) => {
    const match = (a.estimatedCost ?? "").match(/₹([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(/,/g, "")) : 0);
  }, 0);

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-1">
      <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
        <Utensils className="w-3 h-3" />
        {meals} Meals
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-lg">
        <Camera className="w-3 h-3" />
        {attractions} Attractions
      </span>
      {totalCost > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg ml-auto">
          <IndianRupee className="w-3 h-3" />
          ~₹{totalCost.toLocaleString("en-IN")} est.
        </span>
      )}
    </div>
  );
}
function SidebarCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardIn}
      className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</span>
      <h3 className="text-lg font-display font-bold">{title}</h3>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
function TripDetailsContent() {
  const { id } = useParams();
  const { data: trip, isLoading, error } = useTrip(Number(id));
  const { toast } = useToast();
  const { theme, toggleTheme } = useDarkMode();
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  if (isLoading) return <LoadingState />;
  if (error || !trip) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Trip not found
    </div>
  );

  // Defensive parsing for AI-generated structures that might occasionally be wrapped in root object
  const rawItinerary = trip.itinerary;
  let parsedItinerary: any[] = [];
  if (Array.isArray(rawItinerary)) {
    parsedItinerary = rawItinerary;
  } else if (rawItinerary && typeof rawItinerary === 'object') {
    if (Array.isArray((rawItinerary as any).days)) parsedItinerary = (rawItinerary as any).days;
    else if (Array.isArray((rawItinerary as any).itinerary)) parsedItinerary = (rawItinerary as any).itinerary;
    else parsedItinerary = Object.values(rawItinerary).filter(v => typeof v === 'object' && v !== null);
  }

  const itinerary = parsedItinerary;
  const lodging = Array.isArray(trip.lodging) ? trip.lodging : [];
  const costs = trip.estimatedCosts as Record<string, any> | null | undefined;
  const touristSpots: any[] = (trip as any).touristSpots ?? [];
  const foodRecs: any[] = (trip as any).foodRecommendations ?? [];
  
  const destString = typeof trip.destination === 'string' ? trip.destination : "Unknown Destination";
  const cityName = destString.split(",")[0].trim();

  const COST_FIELDS = [
    { icon: <Hotel className="w-3.5 h-3.5 text-blue-500" />, label: "Accommodation", key: "accommodation" },
    { icon: <Bus className="w-3.5 h-3.5 text-teal-500" />, label: "Transportation", key: "transportation" },
    { icon: <Utensils className="w-3.5 h-3.5 text-orange-500" />, label: "Food & Dining", key: "food" },
    { icon: <Activity className="w-3.5 h-3.5 text-violet-500" />, label: "Activities", key: "activities" },
  ];

  const renderCostValue = (val: any): string => {
    if (val === undefined || val === null || val === "") return "Not available";
    if (typeof val === "string") return val;
    if (typeof val === "number") return `₹${val.toLocaleString("en-IN")}`;
    if (Array.isArray(val))
      return val.map((v: any) => `${v?.type ?? v?.name ?? ""}${v?.cost ? `: ${v.cost}` : ""}`).filter(Boolean).join(" • ") || "Not available";
    if (typeof val === "object")
      return `${val.type ?? ""} ${val.range ?? ""}`.trim() || JSON.stringify(val);
    return "Not available";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `My ${trip.days}-Day Trip to ${trip.destination}`, url: window.location.href }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Trip URL copied to clipboard." });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── Nav ── */}
      <nav className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SafarixLogo size={24} />
              <span className="font-display font-bold tracking-tight">SAFARIX AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex" onClick={handleShare}>
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero & Header ── */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden border-b border-border">
        <HeroImage destination={trip.destination} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
          <div className="max-w-[1400px] mx-auto px-6 pb-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2 shadow-sm">
                {cityName}
              </h1>
              <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.startDate} - {trip.endDate}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {trip.days} days</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {trip.travelers} guests</span>
              </div>
            </div>
            {costs?.total && (
              <div className="text-right">
                <div className="text-xs text-white/80 font-bold uppercase tracking-wider mb-1">Estimated Budget</div>
                <div className="text-2xl font-bold text-white drop-shadow-md">
                  {renderCostValue(costs.total)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* ── Day Tabs ── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-none border-b border-border">
          {itinerary.map((day: any, idx: number) => {
             const isActive = idx === activeDayIdx;
             return (
               <button
                 key={idx}
                 onClick={() => setActiveDayIdx(idx)}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                   ${isActive 
                     ? "bg-primary text-primary-foreground shadow-md" 
                     : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                   }`}
               >
                 <CalendarDays className="w-4 h-4" />
                 Day {day.day}
               </button>
             );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* ── Left Column (Itinerary Cards) ── */}
          <div>
            {itinerary[activeDayIdx] && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                    {itinerary[activeDayIdx].day}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    {itinerary[activeDayIdx].theme || `Day ${itinerary[activeDayIdx].day} Itinerary`}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(() => {
                    const dayData = itinerary[activeDayIdx];
                    const rawActs = dayData?.activities || dayData?.places || [];
                    const actsArray = Array.isArray(rawActs) ? rawActs : (typeof rawActs === 'object' ? Object.values(rawActs) : []);
                    
                    if (actsArray.length === 0) {
                      return <div className="col-span-full py-10 text-center text-muted-foreground">No activities scheduled for this day yet.</div>;
                    }

                    return actsArray.map((act: any, aIdx: number) => {
                      const placeName = act?.title ?? act?.name ?? act?.place ?? "Unknown place";
                      const mealType = getMealType(act);
                      
                      return (
                      <Card key={`day${activeDayIdx}-act${aIdx}`} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border">
                        <div className="relative h-48 w-full overflow-hidden">
                           <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                             <PlaceImage placeName={placeName} cityName={cityName} mealType={mealType} activityTime={act.time} presetImage={act.image} />
                           </div>
                           <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                             {MEAL_CONFIG[mealType]?.icon || <Sun className="w-3 h-3 text-slate-500" />}
                             <span className="text-foreground">{mealType === 'attraction' ? 'Activity' : mealType}</span>
                           </div>
                           {act.estimatedCost && (
                             <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold shadow-sm text-foreground">
                               {act.estimatedCost}
                             </div>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                           {act.time && (
                              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-md">
                                <Clock className="w-3.5 h-3.5" />
                                {act.time}
                              </div>
                           )}
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-1">{placeName}</h3>
                          {act.description && (
                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                              {act.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6 hidden lg:block">
            
            {/* Weather & Map */}
            <div className="space-y-4">
              <TripWeather destination={trip.destination} startDate={trip.startDate} />
              <div className="rounded-xl overflow-hidden shadow-sm">
                <TripMap destination={trip.destination} />
              </div>
            </div>

            {/* Accordion for Secondary Lists & Prayer Times */}
            <Accordion type="single" collapsible className="w-full space-y-4">
              
              {/* Islamic Prayer Times */}
              <AccordionItem value="prayer" className="bg-card border-border rounded-xl border shadow-sm px-2">
                 <AccordionTrigger className="px-4 py-3 hover:no-underline">
                   <div className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                     <Moon className="w-5 h-5 text-primary" /> Islamic Prayer Times
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4 pt-2">
                   <TripPrayerTimes
                     destination={trip.destination}
                     startDate={trip.startDate}
                     days={trip.days}
                   />
                 </AccordionContent>
              </AccordionItem>

              {/* Tourist Spots / Must-See */}
              <AccordionItem value="spots" className="bg-card border-border rounded-xl border shadow-sm px-2">
                 <AccordionTrigger className="px-4 py-3 hover:no-underline">
                   <div className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                     <Landmark className="w-5 h-5 text-primary" /> Top & Hidden Spots
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                   {touristSpots && touristSpots.length > 0 ? (
                     <div className="space-y-4 mt-2">
                       {touristSpots.slice(0, 4).map((spot: any, i: number) => (
                         <div key={i} className="flex gap-3">
                           <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                             <PlaceImage placeName={spot.name} cityName={cityName} />
                           </div>
                           <div className="min-w-0">
                             <div className="font-semibold text-sm truncate">{spot.name}</div>
                             <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{spot.description}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground">No specific spots recommended.</p>
                   )}
                 </AccordionContent>
              </AccordionItem>

              {/* Food Recommendations */}
              <AccordionItem value="food" className="bg-card border-border rounded-xl border shadow-sm px-2">
                 <AccordionTrigger className="px-4 py-3 hover:no-underline">
                   <div className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                     <Utensils className="w-5 h-5 text-primary" /> Popular Food Places
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                   {foodRecs && foodRecs.length > 0 ? (
                     <div className="space-y-4 mt-2">
                       {foodRecs.slice(0, 4).map((food: any, i: number) => (
                         <div key={i} className="flex gap-3">
                           <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                             <PlaceImage placeName={food.name} cityName={cityName} />
                           </div>
                           <div className="min-w-0">
                             <div className="font-semibold text-sm truncate">{food.name}</div>
                             <p className="text-xs text-muted-foreground truncate">{food.cuisine}</p>
                             <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{food.description}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground">No specific food places recommended.</p>
                   )}
                 </AccordionContent>
              </AccordionItem>

              {/* Lodging Options */}
              <AccordionItem value="lodging" className="bg-card border-border rounded-xl border shadow-sm px-2">
                 <AccordionTrigger className="px-4 py-3 hover:no-underline">
                   <div className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                     <Hotel className="w-5 h-5 text-primary" /> Lodging Options
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                   {lodging && lodging.length > 0 ? (
                     <div className="space-y-4 mt-2">
                       {lodging.map((lodge: any, i: number) => (
                         <div key={i} className="flex gap-3">
                           <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                             <PlaceImage placeName={lodge.name} cityName={cityName} />
                           </div>
                           <div className="min-w-0">
                             <div className="font-semibold text-sm truncate">{lodge.name}</div>
                             <div className="text-xs text-muted-foreground truncate">{lodge.type ?? "Hotel"}</div>
                             {lodge.cost && <div className="text-xs font-bold text-primary mt-1">{lodge.cost}</div>}
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground">No specific lodging recommended.</p>
                   )}
                 </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripDetails() {
  return (
    <ErrorBoundary>
      <TripDetailsContent />
    </ErrorBoundary>
  );
}

