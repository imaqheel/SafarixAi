import { useParams, Link } from "wouter";
import { useTrip } from "@/hooks/use-trips";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, DollarSign, Share2, Printer, ArrowLeft, Hotel, Coffee, Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function TripDetails() {
  const { id } = useParams();
  const { data: trip, isLoading, error } = useTrip(Number(id));

  if (isLoading) return <LoadingState />; // Or a simpler skeleton loader if preferred
  if (error || !trip) return <div className="text-center py-20">Trip not found</div>;

  // Type assertion for the JSON content
  const itinerary = trip.itinerary as any[];
  const lodging = trip.lodging as any[];
  const costs = trip.estimatedCosts as any;

  // Generic travel hero image
  const heroImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] w-full mt-16">
        <img 
          src={heroImage} 
          alt={trip.destination} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-primary/90 hover:bg-primary text-white border-none mb-4 px-3 py-1 text-sm font-medium">
                {trip.days} Days Trip
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
                {trip.destination}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{trip.startDate} - {trip.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{trip.travelers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>{trip.budget} Budget</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Itinerary Column */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              Daily Itinerary
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4" defaultValue="day-1">
              {itinerary?.map((day: any, index: number) => (
                <AccordionItem 
                  key={index} 
                  value={`day-${day.day}`} 
                  className="bg-white border rounded-2xl px-6 shadow-sm overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{day.theme || `Day ${day.day} Exploration`}</h3>
                        <p className="text-muted-foreground text-sm font-normal line-clamp-1">{day.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <div className="pl-6 border-l-2 border-primary/20 ml-6 space-y-8">
                      {day.activities?.map((activity: any, actIndex: number) => (
                        <div key={actIndex} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-primary bg-white" />
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Placeholder Activity Image */}
                            <div className="w-full sm:w-32 h-24 rounded-lg bg-secondary overflow-hidden shrink-0">
                              <img 
                                src={`https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=300&q=80&random=${index * 10 + actIndex}`} 
                                alt="Activity" 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded">
                                  {activity.time || "Morning"}
                                </span>
                                <h4 className="font-bold text-base">{activity.title}</h4>
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                                {activity.description}
                              </p>
                              {activity.tip && (
                                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 flex gap-2">
                                  <span className="font-bold">💡 Tip:</span> {activity.tip}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          
          {/* Estimated Costs */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Estimated Costs
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-muted-foreground">Accommodation</span>
                <span className="font-bold">{costs?.accommodation || "$0"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-muted-foreground">Activities</span>
                <span className="font-bold">{costs?.activities || "$0"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-muted-foreground">Food & Dining</span>
                <span className="font-bold">{costs?.food || "$0"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-muted-foreground">Transportation</span>
                <span className="font-bold">{costs?.transportation || "$0"}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-lg font-bold">
                <span>Total Estimate</span>
                <span className="text-primary">{costs?.total || "$0"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              *Estimates are approximate and may vary by season. Flights not included.
            </p>
          </div>

          {/* Accommodation Suggestions */}
          <div>
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-primary" />
              Where to Stay
            </h3>
            <div className="space-y-4">
              {lodging?.map((hotel: any, i: number) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 w-full overflow-hidden relative">
                    {/* Hotel placeholder image */}
                    <img 
                      src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80&random=${i}`} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">
                      {hotel.priceRange || "$$"}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-base mb-1">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {hotel.address || trip.destination}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
