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
      className={cn("py-8 md:py-12 border-b border-border last:border-0", className)}
    >
      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          {description}
        </p>
      )}
      <div className="mt-6">
        {children}
      </div>
    </motion.div>
  );
}
