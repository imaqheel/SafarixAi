import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Curated Travel & City Destinations ────────────────────────────────────
const SLIDES = [
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&auto=format&fit=crop&q=80", // Dubai skyline
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&auto=format&fit=crop&q=80", // Rome Colosseum
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&auto=format&fit=crop&q=80", // Paris Eiffel Tower
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&auto=format&fit=crop&q=80", // Bali temple
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&auto=format&fit=crop&q=80", // Santorini
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&auto=format&fit=crop&q=80", // Iceland aurora
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&auto=format&fit=crop&q=80", // Paris Architecture
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&auto=format&fit=crop&q=80", // Swiss Alps
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&auto=format&fit=crop&q=80", // London Big Ben
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&auto=format&fit=crop&q=80", // Switzerland Lake/Mountains
];

// ─── Ken Burns Motion Variants ──────────────────────────────────────────────
const MOTION_DURATION = 9.2; // slide interval + crossfade overlap

const kenBurnsVariants = [
  // 1. Zoom in + upward drift
  {
    initial: { scale: 1.0, x: "0%", y: "2%" },
    animate: { scale: 1.14, x: "0%", y: "-2%", transition: { duration: MOTION_DURATION, ease: "linear" } },
  },
  // 2. Zoom in + left pan
  {
    initial: { scale: 1.0, x: "2%", y: "0%" },
    animate: { scale: 1.12, x: "-2%", y: "0%", transition: { duration: MOTION_DURATION, ease: "linear" } },
  },
  // 3. Zoom in + right pan
  {
    initial: { scale: 1.0, x: "-2%", y: "0%" },
    animate: { scale: 1.13, x: "2%", y: "0%", transition: { duration: MOTION_DURATION, ease: "linear" } },
  },
  // 4. Slow zoom out + upward drift
  {
    initial: { scale: 1.15, x: "0%", y: "2%" },
    animate: { scale: 1.02, x: "0%", y: "-1%", transition: { duration: MOTION_DURATION, ease: "linear" } },
  },
  // 5. Diagonal pan
  {
    initial: { scale: 1.0, x: "-1.5%", y: "1.5%" },
    animate: { scale: 1.12, x: "1.5%", y: "-1.5%", transition: { duration: MOTION_DURATION, ease: "linear" } },
  },
];

// ─── Film Grain SVG ─────────────────────────────────────────────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── Preload all images ─────────────────────────────────────────────────────
function preloadImages(urls: string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't block on failures
          img.src = src;
        })
    )
  ).then(() => {});
}

// ─── Component ──────────────────────────────────────────────────────────────
export function CinematicSlideshow() {
  const [isReady, setIsReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload
  useEffect(() => {
    preloadImages(SLIDES).then(() => setIsReady(true));
  }, []);

  // Auto-advance
  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isReady || isPaused) return;
    timerRef.current = setInterval(advance, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, isPaused, advance]);

  const variant = kenBurnsVariants[current % kenBurnsVariants.length];

  // Loading state
  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Guardian layer: static blurred base — prevents any black flash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${SLIDES[current]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px) brightness(0.5)",
          transform: "scale(1.1)",
        }}
      />

      {/* Animated Ken Burns layer */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={SLIDES[current]}
            alt=""
            initial={variant.initial}
            animate={variant.animate}
            className="w-full h-full object-cover will-change-transform"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Cinematic Overlay Stack ───────────────────────────────────────── */}

      {/* 1. Dark radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* 2. Top-to-bottom gradient for navbar + text legibility */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/60 via-black/20 to-black/50" />

      {/* 3. Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.04,
        }}
      />
    </div>
  );
}

