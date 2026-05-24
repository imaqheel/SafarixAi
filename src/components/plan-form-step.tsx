import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlanFormStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PlanFormStep({ title, description, children, className }: PlanFormStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "py-8 md:py-10 px-5 md:px-8 rounded-2xl",
        "backdrop-blur-xl bg-white/60 dark:bg-black/30 border border-white/40 dark:border-white/10",
        "shadow-2xl shadow-black/5 dark:shadow-black/20",
        className
      )}
    >
      <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 drop-shadow-sm">
        {title}
      </h2>
      {description && (
        <p className="text-slate-600 dark:text-white/60 text-lg mb-8 max-w-2xl">
          {description}
        </p>
      )}
      <div className="mt-6">
        {children}
      </div>
    </motion.div>
  );
}
