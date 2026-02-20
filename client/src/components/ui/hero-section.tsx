import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background pt-16 pb-32">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Travel Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Craft Unforgettable <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              Itineraries in Seconds
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 text-balance">
            Stop spending hours researching. Let our AI build a personalized day-by-day trip plan tailored to your interests, budget, and travel style.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/plan">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                Start Planning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-lg">
              View Sample Itinerary
            </Button>
          </div>
        </motion.div>

        {/* Hero Image / Collage */}
        <motion.div 
          className="mt-20 relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white/50 bg-white">
            {/* landing page hero scenic mountain landscape */}
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
              alt="Travel Planning Dashboard" 
              className="w-full h-auto object-cover"
            />
            
            {/* Floating Cards for Effect */}
            <div className="absolute -bottom-10 -left-10 md:bottom-10 md:-left-12 bg-white p-4 rounded-2xl shadow-xl max-w-xs border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Budget Optimized</p>
                  <p className="text-sm text-gray-500">Smart cost estimation</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-10 -right-10 md:top-10 md:-right-12 bg-white p-4 rounded-2xl shadow-xl max-w-xs border border-gray-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <span className="text-xl">🗺️</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Smart Itinerary</p>
                  <p className="text-sm text-gray-500">Day-by-day breakdown</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
