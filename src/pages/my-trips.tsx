import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { motion } from "framer-motion";
import {
    Moon, Sun, MapPin, Calendar, LogOut, Loader2,
    PlusCircle, Clock, Users, ArrowRight, Sparkles, Plane, Globe, Compass,
} from "lucide-react";

interface TripCard {
    id: number;
    destination: string;
    startDate: string;
    endDate: string;
    days: number;
    budget: string;
    travelers: string;
    createdAt: string;
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardFade = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function MyTrips() {
    const { user, token, isLoading, logout } = useAuth();
    const [, navigate] = useLocation();
    const { theme, toggleTheme } = useDarkMode();
    const [trips, setTrips] = useState<TripCard[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoading && !user) navigate("/login");
    }, [isLoading, user, navigate]);

    useEffect(() => {
        if (!token) return;
        async function load() {
            setFetching(true);
            try {
                const res = await fetch("/api/my-trips", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setTrips(await res.json());
                } else {
                    setError("Could not load your trips.");
                }
            } catch {
                setError("Network error. Please try again.");
            } finally {
                setFetching(false);
            }
        }
        load();
    }, [token]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Loading your trips...</p>
                </div>
            </div>
        );
    }
    if (!user) return null;

    const budgetColor: Record<string, string> = {
        Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        Medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        High: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative">
            {/* Navbar */}
            <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <SafarixLogo size={32} />
                        <span className="font-bold text-lg">Safarix AI</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/plan" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <PlusCircle className="w-4 h-4" /> Plan Trip
                        </Link>
                        <button onClick={toggleTheme} className="p-2 rounded-xl border hover:bg-muted transition-colors" aria-label="Toggle dark mode">
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => { logout(); navigate("/"); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            <span className="gradient-text-animated">My Trips</span>
                        </h1>
                        <p className="text-muted-foreground">Welcome back, {user.name.split(" ")[0]}! Here are all your AI-generated itineraries.</p>
                    </div>
                    <Link href="/plan">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold magnetic-hover transition-all shadow-lg shadow-primary/20">
                            <Sparkles className="w-4 h-4" /> Plan New Trip
                        </button>
                    </Link>
                </motion.div>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Loading your trips...</p>
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 text-muted-foreground"
                    >
                        {error}
                    </motion.div>
                ) : trips.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 text-center relative"
                    >
                        {/* Floating background icons */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-8 left-1/4 opacity-10"
                        >
                            <Plane className="w-12 h-12 text-primary" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-16 right-1/4 opacity-10"
                        >
                            <Compass className="w-10 h-10 text-blue-500" />
                        </motion.div>

                        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
                            <MapPin className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No trips yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            You haven't planned any trips yet. Let our AI build you a personalized itinerary!
                        </p>
                        <Link href="/plan">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold magnetic-hover transition-all shadow-lg shadow-primary/20">
                                <Sparkles className="w-4 h-4" /> Plan Your First Trip
                            </button>
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {trips.map((trip) => (
                            <TripCardItem key={trip.id} trip={trip} budgetColor={budgetColor} />
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}

function TripCardItem({ trip, budgetColor }: { trip: TripCard; budgetColor: Record<string, string> }) {
    const [, navigate] = useLocation();

    return (
        <motion.div
            variants={cardFade}
            className="group bg-white dark:bg-slate-900 border rounded-2xl p-5 tilt-card shine-hover cursor-pointer flex flex-col hover:border-primary/30 dark:hover:border-primary/30 transition-colors duration-300"
            onClick={() => navigate(`/trip/${trip.id}`)}
        >
            {/* Destination header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-base truncate">{trip.destination}</h3>
                        <p className="text-xs text-muted-foreground">{trip.days} {trip.days === 1 ? "day" : "days"}</p>
                    </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${budgetColor[trip.budget] ?? "bg-muted text-muted-foreground"}`}>
                    {trip.budget}
                </span>
            </div>

            {/* Trip meta */}
            <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-grow">
                <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{trip.startDate} → {trip.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{trip.travelers}</span>
                </div>
                {trip.createdAt && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Created {new Date(trip.createdAt).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end text-primary text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                View Itinerary <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
        </motion.div>
    );
}
