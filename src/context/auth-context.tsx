import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAdmin: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithToken: (token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("safarix_token");
        if (savedToken) {
            verifyAndSetUser(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    async function verifyAndSetUser(t: string) {
        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (res.ok) {
                const userData: User = await res.json();
                setUser(userData);
                setToken(t);
            } else {
                localStorage.removeItem("safarix_token");
            }
        } catch {
            localStorage.removeItem("safarix_token");
        } finally {
            setIsLoading(false);
        }
    }

    async function login(email: string, password: string) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        const { token: newToken } = data;
        localStorage.setItem("safarix_token", newToken);
        await verifyAndSetUser(newToken);
    }

    async function register(name: string, email: string, password: string) {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        const { token: newToken } = data;
        localStorage.setItem("safarix_token", newToken);
        await verifyAndSetUser(newToken);
    }

    function logout() {
        localStorage.removeItem("safarix_token");
        setUser(null);
        setToken(null);
    }

    async function loginWithToken(t: string) {
        localStorage.setItem("safarix_token", t);
        await verifyAndSetUser(t);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAdmin: user?.role === "admin",
                isLoading,
                login,
                register,
                loginWithToken,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
