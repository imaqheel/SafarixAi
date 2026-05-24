import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Sun, Users, MapPin, TrendingUp, Zap, Activity, Database,
  LogOut, Shield, Loader2, Search, Trash2, Ban, Server, Compass
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */

interface AdminStats { tripCount: number; userCount: number; }

interface TripRow {
  id: number; destination: string; days: number; budget: string;
  travelers: string; createdAt: string;
  activities?: string[]; options?: { halal?: boolean; vegetarian?: boolean };
  userId?: string;
}

interface UserRow {
  _id: string; name: string; email: string; role: string;
  createdAt: string; suspended?: boolean;
}

interface AnalyticsData {
  growthData: { month: string; users: number; trips: number }[];
  categoryData: { name: string; value: number; color: string }[];
  trafficData: number[];
  destinationCount?: number;
  apiHealth: { status: string; uptime: string };
  aiAccuracy: { status: string; model: string };
  memoryLoad: { status: string; usage: string };
  dbLatency: { status: string; latency: string };
}

type TabKey = "overview" | "users" | "trips" | "analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ─── Main Component ────────────────────────────────────────────── */

export default function Admin() {
  const { user, isAdmin, isLoading, token, logout } = useAuth();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useDarkMode();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");

  // Guard: redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [isLoading, user, isAdmin, navigate]);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Fetch admin data
  const fetchData = useCallback(async () => {
    if (!isAdmin || !token) return;
    setDataLoading(true);
    try {
      const [statsRes, tripsRes, usersRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/trips", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/analytics", { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (tripsRes.ok) setTrips(await tripsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } finally {
      setDataLoading(false);
    }
  }, [isAdmin, token, headers]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Admin Actions ─────────────────────────────────────────── */

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE", headers });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setStats((prev) => prev ? { ...prev, userCount: prev.userCount - 1 } : prev);
      }
    } catch (err) { console.error("Failed to delete user:", err); }
  };

  const suspendUser = async (userId: string, currentlySuspended: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ suspended: !currentlySuspended }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) =>
          u._id === userId ? { ...u, suspended: !currentlySuspended } : u
        ));
      }
    } catch (err) { console.error("Failed to suspend user:", err); }
  };

  const deleteTrip = async (tripId: number) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(`/api/admin/trips/${tripId}`, { method: "DELETE", headers });
      if (res.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
        setStats((prev) => prev ? { ...prev, tripCount: prev.tripCount - 1 } : prev);
      }
    } catch (err) { console.error("Failed to delete trip:", err); }
  };

  /* ─── Filtered Lists ────────────────────────────────────────── */

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredTrips = useMemo(() => {
    if (!tripSearch.trim()) return trips;
    const q = tripSearch.toLowerCase();
    return trips.filter((t) =>
      t.destination.toLowerCase().includes(q) || t.budget.toLowerCase().includes(q)
    );
  }, [trips, tripSearch]);

  /* ─── Derived Stats ─────────────────────────────────────────── */

  const tripStyles = useMemo(() => {
    const styleMap: Record<string, number> = {};
    trips.forEach((t) => {
      const style = t.activities?.[0] || "General";
      styleMap[style] = (styleMap[style] || 0) + 1;
    });
    return styleMap;
  }, [trips]);

  /* ─── Loading & Guard ───────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <SafarixLogo size={32} />
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight">SafariX Admin</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1.5 p-1 bg-muted/50 rounded-full border border-border/50">
            {(["overview", "users", "trips", "analytics"] as TabKey[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  activeTab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === t && (
                  <motion.div
                    layoutId="admin-active-tab"
                    className="absolute inset-0 bg-primary rounded-full shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl border hover:bg-muted transition-colors" aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-bold">{user.name.split(" ")[0]}</span>
                <span className="text-[10px] text-emerald-500 font-bold tracking-wider">AUTHORISED</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { logout(); navigate("/"); }}
              className="ml-2 rounded-full h-9 w-9 text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Mobile tabs (fallback) ─────────────────────────────── */}
      <div className="flex md:hidden overflow-x-auto p-4 border-b bg-muted/30 hide-scroll">
        <div className="flex gap-2">
          {(["overview", "users", "trips", "analytics"] as TabKey[]).map((t) => (
             <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap border transition-colors ${
                activeTab === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-grow flex flex-col overflow-y-auto md:overflow-hidden pb-4 custom-scrollbar">
        
        {/* Header Section */}
        <div className="bg-gradient-to-b from-secondary/40 to-background border-b border-border/50 pt-5 pb-5 px-4 mb-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center md:text-left">
              <Badge variant="outline" className="mb-2 text-primary border-primary/20 bg-primary/10 tracking-widest font-bold text-[10px] uppercase">
                Control Center
              </Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm md:text-base">Manage the platform data, users, and AI generation metrics safely.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col min-h-0">
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex flex-col min-h-0 h-full w-full"
              >
                {/* ═══ OVERVIEW ═══ */}
                {activeTab === "overview" && (
                  <div className="flex-grow flex flex-col gap-4 sm:gap-6 min-h-0 h-full w-full pb-2">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0">
                      <OverviewStatCard
                        icon={<Users className="w-5 h-5 text-violet-500" />}
                        value={stats?.userCount ?? users.length}
                        label="Total Users"
                        trend="+12%"
                        bg="bg-violet-500/10"
                      />
                      <OverviewStatCard
                        icon={<MapPin className="w-5 h-5 text-blue-500" />}
                        value={stats?.tripCount ?? trips.length}
                        label="Total Trips"
                        trend="+8%"
                        bg="bg-blue-500/10"
                      />
                      <OverviewStatCard
                        icon={<Zap className="w-5 h-5 text-amber-500" />}
                        value={stats?.tripCount ?? trips.length}
                        label="AI Generations"
                        trend="+3%"
                        bg="bg-amber-500/10"
                      />
                      <OverviewStatCard
                        icon={<Compass className="w-5 h-5 text-emerald-500" />}
                        value={analytics?.destinationCount ?? 0}
                        label="Destinations"
                        trend="+2"
                        bg="bg-emerald-500/10"
                      />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-grow min-h-0">
                      <Card className="lg:col-span-2 shadow-md border-border/50 flex flex-col min-h-[250px]">
                        <CardHeader className="pb-2 flex-shrink-0">
                          <CardTitle className="text-lg">Platform Growth</CardTitle>
                          <CardDescription>Users & trips generated over 7 months</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow min-h-0 flex items-center justify-center p-2 sm:px-6 sm:pb-6">
                          {analytics && <LineChart data={analytics.growthData} />}
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-md border-border/50 flex flex-col min-h-[250px]">
                        <CardHeader className="pb-2 flex-shrink-0">
                          <CardTitle className="text-lg">Category Split</CardTitle>
                          <CardDescription>Budget distribution trends</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow min-h-0 flex items-center justify-center p-2 sm:px-6 sm:pb-6">
                          {analytics && <DonutChart data={analytics.categoryData} />}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* ═══ USERS ═══ */}
                {activeTab === "users" && (
                  <Card className="shadow-md border-border/50 flex flex-col flex-grow min-h-0 overflow-hidden mb-2">
                    <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                      <div className="relative max-w-sm w-full font-sans">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search users..." 
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-9 w-[150px] sm:w-[300px] rounded-full bg-muted/50 border-border/50"
                        />
                      </div>
                      <Badge variant="secondary" className="w-fit">{filteredUsers.length} Users Found</Badge>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">User</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Email</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Role</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Joined</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {filteredUsers.map((u) => {
                            const initial = u.name.charAt(0).toUpperCase();
                            const colors = ["bg-violet-500", "bg-pink-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-amber-500"];
                            const colorClass = colors[u.name.charCodeAt(0) % colors.length];
                            
                            return (
                              <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${colorClass}`}>
                                      {initial}
                                    </div>
                                    <span className="font-semibold">{u.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                <td className="px-6 py-4">
                                  <Badge variant={u.role === "admin" ? "default" : "secondary"} className={u.role === "admin" ? "bg-primary/20 text-primary hover:bg-primary/30 shadow-none border-none" : ""}>
                                    {u.role.toUpperCase()}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      size="icon" 
                                      variant={u.suspended ? "destructive" : "ghost"}
                                      onClick={() => suspendUser(u._id, !!u.suspended)}
                                      title={u.suspended ? "Unsuspend" : "Suspend"}
                                      className={`h-8 w-8 ${u.suspended ? "opacity-100" : "text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`}
                                    >
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      onClick={() => deleteUser(u._id)}
                                      title="Delete User"
                                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                No users found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* ═══ TRIPS ═══ */}
                {activeTab === "trips" && (
                  <Card className="shadow-md border-border/50 flex flex-col flex-grow min-h-0 overflow-hidden mb-2">
                     <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                      <div className="relative max-w-sm w-full font-sans">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search trips by destination..." 
                          value={tripSearch}
                          onChange={(e) => setTripSearch(e.target.value)}
                          className="pl-9 w-full sm:w-[300px] rounded-full bg-muted/50 border-border/50"
                        />
                      </div>
                      <Badge variant="secondary" className="w-fit">{filteredTrips.length} Trips Found</Badge>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto flex-grow custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">Destination</th>
                            <th className="px-6 py-4 font-bold tracking-wider">User</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Duration</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Budget</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Style</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {filteredTrips.map((trip) => {
                            const style = trip.activities?.[0] || "General";
                            const creator = users.find(u => u._id === trip.userId);
                            return (
                              <tr key={trip.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4 font-semibold">{trip.destination}</td>
                                <td className="px-6 py-4">
                                  {creator ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                        {creator.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-medium text-sm text-foreground">{creator.name}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/60 italic text-xs">Anonymous</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{trip.days} Days</td>
                                <td className="px-6 py-4 text-muted-foreground capitalize">{trip.budget}</td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="bg-background text-muted-foreground capitalize">{style}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => deleteTrip(trip.id)}
                                    title="Delete Trip"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredTrips.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                No trips found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* ═══ ANALYTICS ═══ */}
                {activeTab === "analytics" && analytics && (
                  <div className="flex-grow flex flex-col gap-4 sm:gap-6 min-h-0 h-full w-full pb-2">
                    {/* Status Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0">
                      <AnalyticsStatusCard
                        icon={<Server className="w-5 h-5 text-blue-500" />}
                        title="API Health"
                        subtitle={analytics.apiHealth.uptime}
                        status={analytics.apiHealth.status}
                        statusClass="text-emerald-500 bg-emerald-500/10"
                        bg="bg-blue-500/10"
                      />
                      <AnalyticsStatusCard
                        icon={<Zap className="w-5 h-5 text-amber-500" />}
                        title="AI Accuracy"
                        subtitle={analytics.aiAccuracy.model}
                        status={analytics.aiAccuracy.status}
                        statusClass="text-emerald-500 bg-emerald-500/10"
                        bg="bg-amber-500/10"
                      />
                      <AnalyticsStatusCard
                        icon={<Activity className="w-5 h-5 text-violet-500" />}
                        title="Memory Load"
                        subtitle={analytics.memoryLoad.usage}
                        status={analytics.memoryLoad.status}
                        statusClass="text-emerald-500 bg-emerald-500/10"
                        bg="bg-violet-500/10"
                      />
                      <AnalyticsStatusCard
                        icon={<Database className="w-5 h-5 text-rose-500" />}
                        title="DB Latency"
                        subtitle={analytics.dbLatency.latency}
                        status={analytics.dbLatency.status}
                        statusClass="text-rose-500 bg-rose-500/10"
                        bg="bg-rose-500/10"
                      />
                    </div>

                    {/* Traffic Chart */}
                    <Card className="shadow-md border-border/50 flex flex-col flex-grow min-h-[300px]">
                      <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle className="text-lg">Real-Time Traffic</CardTitle>
                        <CardDescription>Platform requests and completions</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow min-h-0 flex items-center justify-center p-2 sm:px-6 sm:pb-6">
                         <TrafficChart data={analytics.trafficData} months={analytics.growthData.map((d) => d.month)} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}


/* ─── Sub Components ──────────────────────────────────────────── */

function OverviewStatCard({ icon, value, label, trend, bg }: {
  icon: React.ReactNode; value: number; label: string; trend: string; bg: string;
}) {
  return (
    <Card className="shadow-sm border-border/50 overflow-hidden group hover:border-primary/30 transition-colors">
      <CardContent className="p-5 flex flex-col gap-4 relative">
        {/* Decorative background glow */}
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
        
        <div className="flex items-center justify-between relative z-10">
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
            ↗ {trend}
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-3xl font-display font-bold text-foreground leading-none mb-1">{value}</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsStatusCard({ icon, title, subtitle, status, statusClass, bg }: {
  icon: React.ReactNode; title: string; subtitle: string; status: string; statusClass: string; bg: string;
}) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <span className="text-sm font-bold text-foreground leading-tight">{title}</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${statusClass}`}>
          {status}
        </span>
      </CardContent>
    </Card>
  );
}

/* ─── SVG Charts ──────────────────────────────────────────────── */
// Using CSS variables to inherit from Tailwind theme where applicable for dynamic color

function LineChart({ data }: { data: { month: string; users: number; trips: number }[] }) {
  const W = 600, H = 220, PX = 50, PY = 20;
  const maxVal = Math.max(...data.flatMap((d) => [d.users, d.trips]), 1);
  const scaleX = (i: number) => PX + i * ((W - PX * 2) / (data.length - 1));
  const scaleY = (v: number) => H - PY - (v / maxVal) * (H - PY * 2);

  const buildPath = (key: "users" | "trips") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(d[key])}`).join(" ");

  const buildArea = (key: "users" | "trips") =>
    buildPath(key) + ` L${scaleX(data.length - 1)},${H - PY} L${scaleX(0)},${H - PY} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round(maxVal * pct));

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full max-h-[100%] h-auto drop-shadow-sm" style={{ minWidth: "200px" }} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {ticks.map((tick, i) => (
          <g key={`y-axis-tick-${i}`}>
            <line x1={PX} y1={scaleY(tick)} x2={W - PX} y2={scaleY(tick)}
              stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            <text x={PX - 8} y={scaleY(tick) + 4} textAnchor="end"
              fill="currentColor" fillOpacity="0.4" fontSize="10">{tick}</text>
          </g>
        ))}
        {/* Month labels */}
        {data.map((d, i) => (
          <text key={`${d.month}-${i}`} x={scaleX(i)} y={H + 12} textAnchor="middle"
            fill="currentColor" fillOpacity="0.5" fontSize="11" fontWeight="500">{d.month}</text>
        ))}
        {/* Area fills */}
        <path d={buildArea("users")} fill="url(#userGrad)" opacity="0.4" />
        <path d={buildArea("trips")} fill="url(#tripGrad)" opacity="0.3" />
        {/* Lines */}
        <path d={buildPath("users")} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={buildPath("trips")} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <g key={`dots-${i}`}>
            <circle cx={scaleX(i)} cy={scaleY(d.users)} r="3" fill="#8b5cf6" stroke="var(--background)" strokeWidth="1.5" />
            <circle cx={scaleX(i)} cy={scaleY(d.trips)} r="3" fill="#0ea5e9" stroke="var(--background)" strokeWidth="1.5" />
          </g>
        ))}
        {/* Legend */}
        <g transform={`translate(${W / 2 - 50}, ${H + 34})`}>
          <circle cx="0" cy="0" r="4" fill="#8b5cf6" />
          <text x="8" y="4" fill="currentColor" fillOpacity="0.6" fontSize="11" fontWeight="600">Users</text>
          <circle cx="70" cy="0" r="4" fill="#0ea5e9" />
          <text x="78" y="4" fill="currentColor" fillOpacity="0.6" fontSize="11" fontWeight="600">Trips</text>
        </g>
        
        {/* Gradients */}
        <defs>
          <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="tripGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const size = 180, cx = size / 2, cy = size / 2, R = 68, r = 44;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  
  let cumAngle = -90;

  const arcs = data.map((d) => {
    let rawAngle = (d.value / total) * 360;
    // SVG arc command fails when starting and ending at the exact same point.
    const angle = rawAngle >= 360 ? 359.999 : rawAngle;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    cumAngle += rawAngle;
    const x1o = cx + R * Math.cos(startRad), y1o = cy + R * Math.sin(startRad);
    const x2o = cx + R * Math.cos(endRad), y2o = cy + R * Math.sin(endRad);
    const x1i = cx + r * Math.cos(endRad), y1i = cy + r * Math.sin(endRad);
    const x2i = cx + r * Math.cos(startRad), y2i = cy + r * Math.sin(startRad);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M${x1o},${y1o} A${R},${R} 0 ${largeArc},1 ${x2o},${y2o} L${x1i},${y1i} A${r},${r} 0 ${largeArc},0 ${x2i},${y2i} Z`;
    return { ...d, path };
  });

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6 py-2 overflow-hidden">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-[140px] h-[140px] lg:w-[180px] lg:h-[180px] drop-shadow-md flex-shrink-0" preserveAspectRatio="xMidYMid meet">
        <circle cx={cx} cy={cy} r={r-4} fill="currentColor" fillOpacity="0.02" />
        {arcs.map((a, i) => (
          <path 
            key={a.name} 
            d={a.path} 
            fill={a.color} 
            stroke="var(--background)" 
            strokeWidth="2" 
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2.5 w-full sm:w-auto">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ background: d.color }} />
            <span className="text-muted-foreground flex-grow min-w-[80px] font-medium">{d.name}</span>
            <span className="font-bold text-foreground">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrafficChart({ data, months }: { data: number[]; months: string[] }) {
  const W = 700, H = 220, PX = 50, PY = 20;
  const maxVal = Math.max(...data, 1);
  const scaleX = (i: number) => PX + i * ((W - PX * 2) / (data.length - 1));
  const scaleY = (v: number) => H - PY - (v / maxVal) * (H - PY * 2);

  // Smooth curve using quadratic bezier
  let path = `M${scaleX(0)},${scaleY(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const cpx = (scaleX(i - 1) + scaleX(i)) / 2;
    path += ` Q${cpx},${scaleY(data[i - 1])} ${scaleX(i)},${scaleY(data[i])}`;
  }
  const area = path + ` L${scaleX(data.length - 1)},${H - PY} L${scaleX(0)},${H - PY} Z`;

  const ticks = [0, 50, 100, 150, 200];

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full max-h-[100%] h-auto mt-4 drop-shadow-sm" style={{ minWidth: "300px" }} preserveAspectRatio="xMidYMid meet">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PX} y1={scaleY(tick)} x2={W - PX} y2={scaleY(tick)}
              stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            <text x={PX - 8} y={scaleY(tick) + 4} textAnchor="end"
              fill="currentColor" fillOpacity="0.4" fontSize="10">{tick}</text>
          </g>
        ))}
        {months.map((m, i) => (
          <text key={`${m}-${i}`} x={scaleX(i)} y={H + 12} textAnchor="middle"
             fill="currentColor" fillOpacity="0.5" fontSize="11" fontWeight="500">{m}</text>
        ))}
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trafficGrad)" />
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinejoin="round" />
        
        {/* Glow effect on the line */}
        <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="6" strokeLinejoin="round" opacity="0.2" filter="blur(4px)" />
        
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(d)} r="4" fill="#8b5cf6" stroke="var(--background)" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}
