import { HeroSection } from "@/components/ui/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, CreditCard, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Wonderplan</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
              Log in
            </Link>
            <Link href="/plan">
              <Button size="sm" className="rounded-full">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <HeroSection />

        {/* Features Grid */}
        <section className="py-24 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need for the perfect trip</h2>
              <p className="text-lg text-muted-foreground">We take care of the details so you can focus on the experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Sparkles className="w-6 h-6 text-primary" />}
                title="AI-Curated Selection"
                description="Our algorithms find the best spots that match your specific interests and travel style."
              />
              <FeatureCard 
                icon={<Calendar className="w-6 h-6 text-primary" />}
                title="Day-by-Day Plans"
                description="Get a fully structured itinerary with logical routes to maximize your time."
              />
              <FeatureCard 
                icon={<CreditCard className="w-6 h-6 text-primary" />}
                title="Budget Management"
                description="Stay on track with estimated costs for activities, food, and transport."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Wonderplan. Crafted with ❤️ for travelers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="pt-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
