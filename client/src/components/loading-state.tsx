import { motion } from "framer-motion";
import { Plane, Map, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const TIPS = [
  "Finding the best local hidden gems...",
  "Calculating travel times between attractions...",
  "Looking for top-rated restaurants...",
  "Checking weather patterns for your dates...",
  "Optimizing your daily route...",
  "Curating a list of must-see spots...",
  "Balancing relaxation and adventure...",
];

export function LoadingState() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="text-center max-w-md px-6">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 border-t-4 border-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-primary">
            <Plane className="w-8 h-8" />
          </div>
        </div>

        <motion.h3
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-2xl font-display font-bold text-foreground mb-4"
        >
          Building Your Itinerary
        </motion.h3>

        <motion.p
          key={`sub-${tipIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground text-lg"
        >
          {TIPS[tipIndex]}
        </motion.p>
        
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
