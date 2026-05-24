import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { SafarixLogo } from "@/components/safarix-logo";
import { useDarkMode } from "@/context/theme-context";
import { Moon, Sun, Eye, EyeOff, Loader2, ArrowLeft, Plane, Globe, Compass } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "login" | "register";

// Google "G" icon SVG
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function Login() {
    const [tab, setTab] = useState<Tab>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);
    const { login, register, loginWithToken } = useAuth();
    const [, navigate] = useLocation();
    const { theme, toggleTheme } = useDarkMode();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const role = params.get("role");
        const oauthError = params.get("error");

        if (oauthError) {
            setError(oauthError);
            window.history.replaceState({}, "", "/login");
            return;
        }

        if (token) {
            window.history.replaceState({}, "", "/login");
            loginWithToken(token).then(() => {
                navigate(role === "admin" ? "/admin" : "/plan");
            }).catch(() => {
                setError("Google sign-in succeeded but session setup failed. Please try again.");
            });
            return;
        }

        fetch("/api/auth/google/status")
            .then(r => r.json())
            .then(d => setGoogleAvailable(d.available === true))
            .catch(() => setGoogleAvailable(false));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (tab === "login") {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            const storedToken = localStorage.getItem("safarix_token");
            if (storedToken) {
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${storedToken}` },
                });
                if (res.ok) {
                    const me = await res.json();
                    navigate(me.role === "admin" ? "/admin" : "/plan");
                    return;
                }
            }
            navigate("/plan");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleLogin() {
        setGoogleLoading(true);
        window.location.href = "/api/auth/google";
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative mesh-gradient">
            {/* Navbar */}
            <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <SafarixLogo size={34} />
                        <span className="font-display font-bold text-xl tracking-tight">Safarix AI</span>
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl border hover:bg-muted transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </nav>

            {/* Floating travel icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-[15%] opacity-10"
                >
                    <Plane className="w-16 h-16 text-primary" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/3 right-[12%] opacity-10"
                >
                    <Globe className="w-20 h-20 text-blue-500" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 right-[25%] opacity-10"
                >
                    <Compass className="w-12 h-12 text-violet-500" />
                </motion.div>
            </div>

            {/* Main */}
            <main className="flex-grow flex items-center justify-center px-4 py-6 sm:py-10 relative z-10 h-[calc(100vh-64px)] overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Back link */}
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to home
                    </Link>

                    {/* Card */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 rounded-3xl shadow-2xl p-6 sm:p-8 border-glow">

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, x: tab === "login" ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: tab === "login" ? 20 : -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <h1 className="text-2xl font-bold text-center mb-1">
                                    {tab === "login" ? "Welcome back" : "Create an account"}
                                </h1>
                                <p className="text-center text-muted-foreground text-sm mb-5">
                                    {tab === "login" ? "Sign in to your Safarix account" : "Join Safarix and start exploring"}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Google Sign-in Button */}
                        <div className="relative group mb-5">
                            <button
                                id="google-signin-btn"
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading || googleAvailable === false}
                                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed magnetic-hover"
                            >
                                {googleLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <GoogleIcon />
                                )}
                                Continue with Google
                                {googleAvailable === false && (
                                    <span className="ml-1 text-[10px] text-amber-500 font-normal">(not configured)</span>
                                )}
                            </button>
                            {googleAvailable === false && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-slate-800 text-white px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    Requires Google API credentials in .env
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative mb-5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-3 bg-white/80 dark:bg-slate-900/80 text-muted-foreground">or continue with email</span>
                            </div>
                        </div>

                        {/* Tab Toggle with sliding indicator */}
                        <div className="relative flex bg-muted rounded-xl p-1 mb-6 gap-1">
                            <motion.div
                                className="absolute inset-y-1 rounded-lg bg-white dark:bg-slate-800 shadow"
                                initial={false}
                                animate={{
                                    left: tab === "login" ? "4px" : "50%",
                                    right: tab === "login" ? "50%" : "4px",
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                            <button
                                id="login-tab-btn"
                                onClick={() => { setTab("login"); setError(""); }}
                                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Log In
                            </button>
                            <button
                                id="register-tab-btn"
                                onClick={() => { setTab("register"); setError(""); }}
                                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {tab === "register" && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium mb-1.5">Full Name</label>
                                        <input
                                            id="register-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            required
                                            className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                <input
                                    id="auth-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        id="auth-password"
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={tab === "register" ? "Min. 6 characters" : "Enter your password"}
                                        required
                                        className="w-full px-4 py-3 pr-11 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPass ? "Hide password" : "Show password"}
                                    >
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                id="auth-submit-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 magnetic-hover shadow-lg shadow-primary/20"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {tab === "login" ? "Sign In" : "Create Account"}
                            </button>
                        </form>

                        {tab === "login" && (
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Admin? Register with <span className="font-mono">admin@safarix.com</span> to access the dashboard
                            </p>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
