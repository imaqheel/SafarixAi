import { motion, AnimatePresence } from "framer-motion";
import { Plane, Globe, Compass, Map } from "lucide-react";
import { useState, useEffect } from "react";

const TIPS = [
  "Finding the best local hidden gems…",
  "Calculating travel times between attractions…",
  "Looking for top-rated restaurants…",
  "Checking weather patterns for your dates…",
  "Optimizing your daily route…",
  "Curating a list of must-see spots…",
  "Balancing relaxation and adventure…",
];

export function LoadingState() {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipIv = setInterval(() => {
      setTipIndex((p) => (p + 1) % TIPS.length);
    }, 2800);
    return () => clearInterval(tipIv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 3 + 0.5, 95));
    }, 400);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      {/* Mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] animate-float-delay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/8 rounded-full blur-[80px] animate-float" />
      </div>

      <div className="relative text-center max-w-md px-6 z-10">
        {/* Orbital spinner */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-primary/30"
            style={{ borderTopColor: "hsl(187 100% 45%)", borderRightColor: "transparent" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-6 rounded-full border-2 border-blue-400/30"
            style={{ borderBottomColor: "hsl(220 90% 60%)", borderLeftColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          {/* Orbiting dot */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
          </motion.div>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Globe className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </motion.div>
          </div>
          {/* Floating mini icons */}
          <motion.div
            className="absolute -top-3 -right-3"
            animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plane className="w-4 h-4 text-primary" />
            </div>
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-4"
            animate={{ y: [0, -8, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Compass className="w-4 h-4 text-blue-500" />
            </div>
          </motion.div>
          <motion.div
            className="absolute -bottom-3 -right-5"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Map className="w-3.5 h-3.5 text-violet-500" />
            </div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold text-foreground mb-3"
        >
          Building Your Itinerary
        </motion.h3>

        {/* Animated tips */}
        <div className="h-16 flex items-center justify-center overflow-hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Generating...</span>
            <span className="font-mono tabular-nums w-8 text-right">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full aurora-bg"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
