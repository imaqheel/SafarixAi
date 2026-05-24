import { useState, useEffect, useMemo } from "react";
import { Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Prayer metadata (display config) ──────────────────────────────────────── */
const PRAYER_META = [
  { key: "Fajr",    label: "Fajr",    iconType: "moon",  dotColor: "bg-indigo-400",  hoverBg: "hover:bg-indigo-500/8 dark:hover:bg-indigo-400/10" },
  { key: "Sunrise", label: "Sunrise", iconType: "sun",   dotColor: "bg-amber-400",   hoverBg: "hover:bg-amber-500/8 dark:hover:bg-amber-400/10" },
  { key: "Dhuhr",   label: "Dhuhr",   iconType: "sun",   dotColor: "bg-yellow-500",  hoverBg: "hover:bg-yellow-500/8 dark:hover:bg-yellow-400/10" },
  { key: "Asr",     label: "Asr",     iconType: "sun",   dotColor: "bg-orange-400",  hoverBg: "hover:bg-orange-500/8 dark:hover:bg-orange-400/10" },
  { key: "Maghrib", label: "Maghrib", iconType: "sun",   dotColor: "bg-rose-400",    hoverBg: "hover:bg-rose-500/8 dark:hover:bg-rose-400/10" },
  { key: "Isha",    label: "Isha",    iconType: "moon",  dotColor: "bg-violet-400",  hoverBg: "hover:bg-violet-500/8 dark:hover:bg-violet-400/10" },
] as const;

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function to12h(raw: string): string {
  const clean = raw.replace(/\s*\(.*\)/, "").trim();
  const parts = clean.split(":");
  if (parts.length < 2) return raw;
  const h = parseInt(parts[0]);
  const m = parts[1];
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

function offsetDate(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export function TripPrayerTimes({
  destination,
  startDate,
  days,
}: {
  destination: string;
  startDate: string;
  days: number;
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [hijri, setHijri] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const curDate = useMemo(() => offsetDate(startDate, dayOffset), [startDate, dayOffset]);

  const { city, country } = useMemo(() => {
    const parts = destination.split(",").map((s) => s.trim());
    return { city: parts[0], country: parts.length > 1 ? parts[parts.length - 1] : parts[0] };
  }, [destination]);

  useEffect(() => {
    let dead = false;
    (async () => {
      setLoading(true);
      setHasError(false);
      try {
        const [y, m, d] = curDate.split("-");
        const apiDate = `${d}-${m}-${y}`;
        const resp = await fetch(
          `https://api.aladhan.com/v1/timingsByCity/${apiDate}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`,
        );
        const json = await resp.json();
        if (dead) return;
        if (json.code === 200 && json.data) {
          setTimings(json.data.timings);
          const h = json.data.date?.hijri;
          setHijri(h ? `${h.day} ${h.month.en} ${h.year} AH` : "");
          const meta = json.data.meta;
          setMethod(meta?.method?.name ?? "");
        } else {
          setHasError(true);
        }
      } catch {
        if (!dead) setHasError(true);
      } finally {
        if (!dead) setLoading(false);
      }
    })();
    return () => { dead = true; };
  }, [curDate, city, country]);

  /* Hide completely on hard error */
  if (hasError && !timings) return null;

  return (
    <div className="prayer-card rounded-2xl overflow-hidden border border-teal-200/40 dark:border-teal-700/30 shadow-sm select-none">

      {/* ── Gradient header ── */}
      <div
        className="relative px-5 pt-5 pb-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #047857 100%)" }}
      >
        {/* Decorative crescent */}
        <div className="absolute -top-3 -right-3 opacity-[0.07] pointer-events-none">
          <Moon className="w-28 h-28 text-white" />
        </div>
        {/* Subtle star dots */}
        <div className="absolute top-3 right-14 w-1 h-1 rounded-full bg-white/20" />
        <div className="absolute top-7 right-9 w-0.5 h-0.5 rounded-full bg-white/15" />
        <div className="absolute top-2 right-24 w-0.5 h-0.5 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Moon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-bold tracking-[0.15em] uppercase text-white/95">
              Prayer Times
            </span>
          </div>
          {hijri && (
            <p className="text-[11px] text-white/60 mt-1.5 font-medium">{hijri}</p>
          )}
          <p className="text-[11px] text-white/45 mt-0.5">{city}</p>
        </div>
      </div>

      {/* ── Times list ── */}
      <div className="bg-white dark:bg-slate-800/90 px-3 py-3">
        {loading ? (
          <div className="space-y-1.5 py-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {PRAYER_META.map((p) => {
              const raw = timings?.[p.key];
              if (!raw) return null;
              const isSunrise = p.key === "Sunrise";
              return (
                <div
                  key={p.key}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                    ${p.hoverBg} group ${isSunrise ? "opacity-55" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Colored dot */}
                    <span className={`w-2 h-2 rounded-full ${p.dotColor} ring-2 ring-white dark:ring-slate-800 shadow-sm ${isSunrise ? "opacity-50" : ""}`} />
                    {/* Icon */}
                    <span className={`${isSunrise ? "text-muted-foreground" : "text-foreground/60"}`}>
                      {p.iconType === "moon" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    </span>
                    <span className={`text-[13px] font-semibold ${isSunrise ? "text-muted-foreground" : "text-foreground"}`}>
                      {p.label}
                    </span>
                  </div>
                  <span
                    className={`text-[13px] font-mono font-bold tabular-nums tracking-tight
                      ${isSunrise ? "text-muted-foreground" : "text-foreground/80"}`}
                  >
                    {to12h(raw)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Day navigator ── */}
      {days > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-teal-100/60 dark:border-teal-800/20 bg-teal-50/30 dark:bg-teal-950/15">
          <button
            onClick={() => setDayOffset((o) => Math.max(0, o - 1))}
            disabled={dayOffset === 0}
            className="p-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800/40 disabled:opacity-20 transition"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground tracking-wide">
            Day {dayOffset + 1} · {shortDate(curDate)}
          </span>
          <button
            onClick={() => setDayOffset((o) => Math.min(days - 1, o + 1))}
            disabled={dayOffset >= days - 1}
            className="p-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800/40 disabled:opacity-20 transition"
            aria-label="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
