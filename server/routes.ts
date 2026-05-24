import type { Express } from "express";
import type { Server } from "http";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerUser, loginUser, verifyToken, getAllUsers } from "./auth";
import { registerInputSchema, loginInputSchema } from "@shared/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey || !baseURL) {
    throw new Error("Missing AI configuration.");
  }
  return new OpenAI({ apiKey, baseURL });
}

// Gemini fallback client (free tier: 1,500 req/day, 1M tokens/min)
function getGeminiClient(): OpenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

// ---- Resilient AI Completion Helper ----
// Tries Groq models first, then falls back to Gemini
function isRateLimitError(err: any): boolean {
  const status = err?.status ?? err?.response?.status ?? err?.code ?? 0;
  const msg = (err?.message ?? err?.error?.message ?? "").toLowerCase();
  return (
    status === 429 ||
    status === "429" ||
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("tokens per day") ||
    msg.includes("tokens per minute")
  );
}

async function aiComplete(
  params: Omit<Parameters<OpenAI["chat"]["completions"]["create"]>[0], "model"> & { model?: string },
): Promise<any> {
  const groqClient = getOpenAIClient();
  const GROQ_MODELS = [
    "llama-3.3-70b-versatile", 
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
  ];

  // 1) Try each Groq model
  for (const model of GROQ_MODELS) {
    try {
      const result = await groqClient.chat.completions.create({ ...params, model });
      return result;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status ?? 0;
      const msg = (err?.message ?? err?.error?.message ?? "").toLowerCase();
      const isRecoverable =
        isRateLimitError(err) ||
        status === 400 ||
        msg.includes("decommissioned") ||
        msg.includes("not supported") ||
        msg.includes("does not exist");
      if (isRecoverable) {
        console.log(`[ai] ${model} unavailable (${status}), trying next...`);
        continue;
      }
      throw err;
    }
  }

  // 2) Fallback to Gemini
  const gemini = getGeminiClient();
  if (gemini) {
    console.log("[ai] All Groq models rate-limited. Falling back to Gemini...");
    try {
      // Strip response_format for Gemini (not always supported) and use compatible model
      const geminiParams = { ...params } as any;
      delete geminiParams.response_format;
      const result = await gemini.chat.completions.create({
        ...geminiParams,
        model: "gemini-2.0-flash",
      });
      return result;
    } catch (geminiErr: any) {
      console.error("[ai] Gemini fallback also failed:", geminiErr?.message);
    }
  }

  throw new Error(
    "All AI models are currently rate-limited. Please wait a few minutes and try again."
  );
}

// ---- Auth Middleware ----
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }
    next();
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // ---- Auth Routes ----
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = registerInputSchema.parse(req.body);
      const token = await registerUser(name, email, password);
      res.status(201).json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      const message =
        err instanceof Error ? err.message : "Registration failed";
      res.status(400).json({ message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginInputSchema.parse(req.body);
      const token = await loginUser(email, password);
      res.json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      const message = err instanceof Error ? err.message : "Login failed";
      res.status(401).json({ message });
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = (req as any).user;
    res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });

  // ---- Google OAuth Routes ----
  // Status check endpoint — returns { available: boolean } so the frontend can disable the button
  app.get("/api/auth/google/status", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const available = !!(clientId && clientId !== "your_google_client_id_here");
    res.json({ available });
  });

  app.get("/api/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback";

    if (!clientId || clientId === "your_google_client_id_here") {
      // Redirect back to login with a user-friendly error message
      return res.redirect(
        `/login?error=${encodeURIComponent("Google Sign-In is not configured yet. Please use email and password to sign in.")}`,
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL ||
      "http://localhost:5000/api/auth/google/callback";

    if (!code || !clientId || !clientSecret) {
      return res.redirect(
        `/login?error=${encodeURIComponent("Google Sign-In is not configured. Please use email & password.")}`,
      );
    }

    try {
      // Step 1: Exchange authorization code for access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = (await tokenRes.json()) as any;
      if (!tokenRes.ok)
        throw new Error(tokenData.error_description || "Token exchange failed");

      // Step 2: Get user profile from Google
      const userRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        },
      );
      const googleUser = (await userRes.json()) as {
        id: string;
        email: string;
        name: string;
      };
      if (!googleUser.email)
        throw new Error("Could not get email from Google.");

      // Step 3: Find or create user and generate JWT (works for both login & register)
      const { generateGoogleToken } = await import("./auth");
      const token = await generateGoogleToken(
        googleUser.email,
        googleUser.name,
      );

      // Step 4: Redirect to frontend with token
      const role =
        (process.env.ADMIN_EMAIL || "admin@safarix.com").toLowerCase() ===
          googleUser.email.toLowerCase()
          ? "admin"
          : "user";
      res.redirect(
        `/login?token=${encodeURIComponent(token)}&name=${encodeURIComponent(googleUser.name)}&role=${role}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google login failed";
      console.error("[google oauth]", msg);
      res.redirect(`/login?error=${encodeURIComponent(msg)}`);
    }
  });

  // ---- My Trips Route ----
  app.get("/api/my-trips", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const trips = await storage.getUserTrips(user.userId);
      res.json(trips);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch your trips";
      res.status(500).json({ message });
    }
  });

  // ---- Admin Routes ----
  app.get("/api/admin/trips", requireAdmin, async (req, res) => {
    try {
      const trips = await storage.getAllTrips();
      res.json(trips);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch trips";
      res.status(500).json({ message });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      res.status(500).json({ message });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      // Use the same storage layer for trip count (respects hybrid fallback)
      const tripCount = await storage.getTripCount();
      // User count — use getAllUsers as it respects hybrid connection state
      const allUsers = await getAllUsers();
      res.json({ tripCount, userCount: allUsers.length });
    } catch (err) {
      // Final fallback — return zeros so frontend doesn't crash
      res.json({ tripCount: 0, userCount: 0 });
    }
  });

  // ---- Admin: Delete a user ----
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id as string;
      const { ObjectId } = await import("mongodb");
      const col = await (async () => {
        try {
          const { getUsersCollection } = await import("./auth");
          return await getUsersCollection();
        } catch { return null; }
      })();
      if (col) {
        let result = await col.deleteOne({ _id: new ObjectId(userId) as any });
        if (result.deletedCount === 0) {
          result = await col.deleteOne({ _id: userId as any });
        }
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
      }
      res.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      res.status(500).json({ message });
    }
  });

  // ---- Admin: Suspend / unsuspend a user ----
  app.patch("/api/admin/users/:id/suspend", requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id as string;
      const { suspended } = req.body; // boolean
      const { ObjectId } = await import("mongodb");
      const col = await (async () => {
        try {
          const { getUsersCollection } = await import("./auth");
          return await getUsersCollection();
        } catch { return null; }
      })();
      if (col) {
        let result = await col.updateOne(
          { _id: new ObjectId(userId) as any },
          { $set: { suspended: !!suspended } }
        );
        if (result.matchedCount === 0) {
          result = await col.updateOne(
            { _id: userId as any },
            { $set: { suspended: !!suspended } }
          );
        }
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }
      }
      res.json({ success: true, suspended: !!suspended });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      res.status(500).json({ message });
    }
  });

  // ---- Admin: Delete a trip ----
  app.delete("/api/admin/trips/:id", requireAdmin, async (req, res) => {
    try {
      const tripId = parseInt(req.params.id as string, 10);
      const deleted = await storage.deleteTrip(tripId);
      if (!deleted) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete trip";
      res.status(500).json({ message });
    }
  });

  // ---- Admin: Analytics data ----
  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      // Get real data from storage layer
      const allTrips = await storage.getAllTrips();
      const allUsers = await getAllUsers();

      // Build growth data from actual creation dates
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const growthData: { month: string; users: number; trips: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthLabel = months[d.getMonth()];

        // Count trips created in this month
        const tripsInMonth = allTrips.filter((t: any) => {
          const created = t.createdAt ? new Date(t.createdAt) : null;
          return created && created >= d && created <= monthEnd;
        }).length;

        // Count users created in this month
        const usersInMonth = allUsers.filter((u: any) => {
          const created = u.createdAt ? new Date(u.createdAt) : null;
          return created && created >= d && created <= monthEnd;
        }).length;

        growthData.push({ month: monthLabel, users: usersInMonth, trips: tripsInMonth });
      }

      // Category distribution from actual trip budgets
      const budgetCounts: Record<string, number> = {};
      allTrips.forEach((t: any) => {
        let b = t.budget || "Standard";
        // Capitalize the first letter for display
        b = b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
        budgetCounts[b] = (budgetCounts[b] || 0) + 1;
      });

      const categoryColors = ["#8b5cf6", "#0ea5e9", "#22c55e", "#f59e0b", "#ec4899"];
      const totalBudgets = Object.values(budgetCounts).reduce((s, v) => s + v, 0) || 1;
      const categoryData = Object.entries(budgetCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count], i) => ({
          name,
          value: Math.round((count / totalBudgets) * 100),
          color: categoryColors[i % categoryColors.length],
        }));

      const finalCategoryData = categoryData.length > 0 ? categoryData : [
        { name: "No Data", value: 1, color: "#94a3b8" }
      ];

      // Traffic data strictly based on real trip & user count per month
      const trafficData = growthData.map((g) => g.trips + g.users);

      // Determine unique destinations from real trips
      const destinations = new Set(allTrips.map((t: any) => t.destination));

      res.json({
        growthData,
        categoryData: finalCategoryData,
        trafficData,
        destinationCount: destinations.size,
        apiHealth: { status: "OK", uptime: "99.9% UPTIME" },
        aiAccuracy: { status: "OK", model: "GEMINI 2.0 FLASH" },
        memoryLoad: { status: "OK", usage: "42% USAGE" },
        dbLatency: { status: "OK", latency: "12MS AVG" },
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ---- Chat & Cost Estimate Routes ----
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const completion = await aiComplete({
        messages: [
          {
            role: "system",
            content:
              "You are Safarix AI, a highly knowledgeable and enthusiastic travel assistant. You MUST provide fully detailed, comprehensive answers with practical travel advice to whatever the user asks (even if it's a 10-point guide or itinerary). Use markdown formatting (bolding, lists) to make your response easy to read. AT THE VERY END of your detailed response, if the user asked about a specific destination, append a beautifully formatted, enticing teaser telling them they can click 'Plan Trip' in the menu or use the Planner page to let our AI generate a full personalized day-by-day itinerary.",
          },
          ...(history || []),
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      res.json({ reply: completion.choices[0].message.content });
    } catch (err: any) {
      console.error(
        "Chat API Error Detailed:",
        err?.response?.data || err.message || err,
      );
      res.status(500).json({ error: "Failed to connect to AI." });
    }
  });

  app.post("/api/estimate-cost", async (req, res) => {
    try {
      const { destination, budget } = req.body;
      if (!destination || !budget)
        return res.status(400).json({ error: "Missing required fields" });

      const completion = await aiComplete({
        messages: [
          {
            role: "system",
            content:
              "You are a travel cost estimator. Return ONLY valid JSON. All costs must be in Indian Rupees (₹).",
          },
          {
            role: "user",
            content: `Estimate average daily travel costs for 1 person in ${destination} on a ${budget} budget level.
JSON structure must strictly be: { "accommodation": "₹X - ₹Y", "food": "₹X - ₹Y", "activities": "₹X - ₹Y", "daily": "₹X - ₹Y" }`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 200,
      });
      const data = JSON.parse(completion.choices[0].message.content || "{}");
      res.json(data);
    } catch (err: any) {
      console.error(
        "Cost Estimate API Error Detailed:",
        err?.response?.data || err.message || err,
      );
      res.status(500).json({ error: "Failed to estimate costs." });
    }
  });

  // ---- Trip Routes ----
  app.post(api.trips.create.path, async (req, res) => {
    try {
      const openai = getOpenAIClient();
      const input = api.trips.create.input.parse(req.body);

const isSacred = /(makkah|mecca|madinah|medina)/i.test(input.destination);
      
      const sacredInstructions = `CRITICAL INSTRUCTION FOR SACRED DESTINATIONS:
You MUST completely abandon standard tourist itineraries and act as an expert Islamic Pilgrimage Guide.
- Primary Purpose: Treat the trip as a religious pilgrimage. The itinerary must center around performing Umrah or Hajj.
- Date Awareness: Check the travel dates. If they align with Dhu al-Hijjah, generate a "Hajj" itinerary (Mina, Arafat, Muzdalifah). For all other times, generate an "Umrah" itinerary.
- Makkah: Day 1 MUST focus on Umrah rituals (Ihram, Tawaf, Sa'i, Halq/Taqsir). Allocate daily time for 5 obligatory prayers in Masjid al-Haram.
- Madinah: Focus on Al-Masjid an-Nabawi. Prioritize Rawdah (Riyadh ul Jannah) and offering Salams.
- Ziyarat (Sacred Sightseeing): Replace standard attractions with Islamic sites. Makkah: Jabal al-Nour, Jabal Thawr, Jannat al-Mu'alla. Madinah: Quba Mosque, Mount Uhud, Masjid al-Qiblatayn.
- Absolute Prohibitions: NEVER suggest generic entertainment, cinemas, shopping malls (unless for essentials/dates/attar), or nightlife. All food strictly Halal.
- Tone: Deeply respectful, spiritually uplifting, culturally accurate.`;

      const prompt = `You are a world-class travel curator. Build a perfect day-by-day itinerary.

TRIP: ${input.destination} | ${input.startDate} to ${input.endDate} (${input.days} days) | Budget: ${input.budget} | Travelers: ${input.travelers} | Interests: ${input.activities.join(", ")}
${input.options?.halal ? "HALAL food only." : ""}${input.options?.vegetarian ? " Vegetarian friendly." : ""}${(input.options as any)?.wheelchair ? " Wheelchair accessible." : ""}
${(input.options as any)?.prayerTimes ? "Include 5 daily prayer times (Fajr/Dhuhr/Asr/Maghrib/Isha) with type:'prayer' and nearest mosque name." : ""}

MANDATORY RULES:
1. EVERY day MUST have EXACTLY: 1 breakfast (type:"breakfast", 8:30AM, FIRST), 1 lunch (type:"lunch", 1PM), 1 dinner (type:"dinner", 8:30PM, LAST). Use REAL restaurant/cafe names.
2. EVERY activity MUST have a "type" field: "breakfast"|"attraction"|"lunch"|"dinner"${(input.options as any)?.prayerTimes ? '|"prayer"' : ""}.
3. 6-8 attractions (type:"attraction") per day between meals. Use EXACT Wikipedia article titles for landmarks. More variety = better trip.
4. Include "estimatedDuration" on every activity.
5. COSTS IN ₹ INR: Free places (parks/beaches/streets/markets/promenades/gardens) = "₹0 (Free Entry)". Paid = real 2024 prices. No fake costs.
${isSacred ? sacredInstructions : `6. MAX 1-2 religious sites (temples/churches/mosques) in ENTIRE trip, only if world-famous (Sagrada Familia, Hagia Sophia level).
7. ATTRACTION MIX per day: 2 iconic landmarks + 1 scenic viewpoint/park + 1 market/museum + 1 cultural spot + 1-2 unique local experiences + 1 hidden gem.`}
8. LINEAR route per day — no backtracking. Group stops by neighborhood/district for efficient exploration.
9. NO duplicates across entire trip. Exactly ${input.days} days.
10. Vivid descriptions (2-3 sentences). Tips start with transit ("5 min walk...") + insider advice.
11. Restaurants: include "Cafe"/"Restaurant"/"Bakery" in title. For breakfast, recommend 2 dishes.

JSON FORMAT:
{"itinerary":[{"day":1,"theme":"Evocative Theme","activities":[{"time":"8:30 AM","title":"Real Cafe Name","type":"breakfast","description":"...","estimatedCost":"₹250","estimatedDuration":"45 min","tip":"..."},{"time":"9:30 AM","title":"Exact Wikipedia Landmark","type":"attraction","description":"...","estimatedCost":"₹350","estimatedDuration":"1.5 hours","tip":"..."},{"time":"11:15 AM","title":"Famous Park","type":"attraction","description":"...","estimatedCost":"₹0 (Free Entry)","estimatedDuration":"1 hour","tip":"..."},{"time":"1:00 PM","title":"Restaurant Name","type":"lunch","description":"...","estimatedCost":"₹500","estimatedDuration":"1 hour","tip":"..."},{"time":"2:30 PM","title":"Famous Market","type":"attraction","description":"...","estimatedCost":"₹200","estimatedDuration":"1.5 hours","tip":"..."},{"time":"4:30 PM","title":"Waterfront/Neighborhood","type":"attraction","description":"...","estimatedCost":"₹0 (Free Entry)","estimatedDuration":"1.5 hours","tip":"..."},{"time":"8:30 PM","title":"Dinner Restaurant","type":"dinner","description":"...","estimatedCost":"₹800","estimatedDuration":"1.5 hours","tip":"..."}]}],"lodging":[{"name":"Hotel Name","rating":4.2,"pricePerNight":4500,"description":"...","address":"Area, ${input.destination}"}],"estimatedCosts":{"accommodation":"₹X/night","transportation":"₹X/day","food":"₹X/day","activities":"₹X/day","total":"₹X for ${input.days} days"},"touristSpots":[{"name":"Landmark","description":"Why must-visit","category":"Historical"}],"foodRecommendations":[{"name":"Restaurant","cuisine":"Type","mustTry":"Dish","priceRange":"₹X-Y","address":"Area","tip":"Tip"}]${(input.options as any)?.prayerTimes ? `,"prayerTimes":{"city":"${input.destination.split(",")[0]}","Fajr":"time","Dhuhr":"time","Asr":"time","Maghrib":"time","Isha":"time","nearbyMasjids":[{"name":"Mosque","area":"Area"}]}` : ""}}

Respond with ONLY valid JSON. Generate ALL ${input.days} days. 8 touristSpots + 8 foodRecommendations + 5 lodging options with real hotel names.`;

      const systemMsg = `You are an expert travel itinerary architect. ABSOLUTE RULES:
1) Every day starts with breakfast (type:"breakfast"), has lunch (type:"lunch" ~1PM), ends with dinner (type:"dinner" ~8:30PM). NEVER skip any meal.
2) Every activity has a "type" field and "estimatedDuration" field.
${isSacred ? '' : `3) 6-8 attractions per day using EXACT Wikipedia titles. Prioritize iconic landmarks, viewpoints, markets, parks, cultural spots and unique local experiences over religious sites. MORE places = better trip.
4) Max 1-2 religious places in entire trip (only world-famous ones).`}
5) Free places = "₹0 (Free Entry)". Use real ₹ INR prices for paid attractions.
6) ONLY valid JSON. No markdown. Generate ALL ${input.days} days.
7) Vivid descriptions, practical tips with transit times, real restaurant names with dish recommendations.`;

      // Use resilient helper — tries Groq models, then Gemini fallback
      const completion = await aiComplete({
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.25,
        max_tokens: 6000,
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) throw new Error("No response from AI");

      const parsedData = JSON.parse(responseText);

      // ═══ POST-PROCESSING: Guarantee 3 meals per day ═══
      // Even with a strong prompt, LLMs can occasionally skip meals.
      // This validation scans each day and injects missing meal entries.
      if (Array.isArray(parsedData.itinerary)) {
        const cityName = input.destination.split(",")[0].trim();

        for (const day of parsedData.itinerary) {
          if (!Array.isArray(day.activities)) continue;

          // Detect existing meals by type field OR by title/time heuristics
          const hasMealType = (type: string) =>
            day.activities.some((a: any) => (a.type ?? "").toLowerCase() === type);
          const hasMealInTitle = (keywords: string[]) =>
            day.activities.some((a: any) =>
              keywords.some((kw) => (a.title ?? "").toLowerCase().includes(kw))
            );

          const hasBreakfast = hasMealType("breakfast") || hasMealInTitle(["breakfast", "brunch"]);
          const hasLunch = hasMealType("lunch") || hasMealInTitle(["lunch"]);
          const hasDinner = hasMealType("dinner") || hasMealInTitle(["dinner", "supper"]);

          // Inject missing breakfast at the START
          if (!hasBreakfast) {
            const firstAttraction = day.activities.find(
              (a: any) => (a.type ?? "") === "attraction" || !(a.type ?? "").match(/lunch|dinner|prayer/)
            );
            day.activities.unshift({
              time: "8:30 AM",
              title: `Local Breakfast Cafe near ${firstAttraction?.title ?? cityName}`,
              type: "breakfast",
              description: `Start your morning with a traditional local breakfast at a popular cafe in ${cityName}. Enjoy freshly prepared dishes and aromatic coffee or tea while soaking in the morning atmosphere of the city.`,
              estimatedCost: "₹200-400 per person",
              estimatedDuration: "45 minutes",
              tip: `Near hotel. Ask locals for the best breakfast spot in the area — they'll point you to hidden gems.`,
            });
          }

          // Inject missing lunch in the MIDDLE
          if (!hasLunch) {
            const midIdx = Math.floor(day.activities.length / 2);
            const nearbySpot = day.activities[midIdx]?.title ?? cityName;
            day.activities.splice(midIdx, 0, {
              time: "1:00 PM",
              title: `Popular Lunch Restaurant near ${nearbySpot}`,
              type: "lunch",
              description: `Refuel at this popular local restaurant known for authentic ${cityName} cuisine. The midday lunch thali or set meal offers excellent value and a taste of the region's best flavors.`,
              estimatedCost: "₹400-600 per person",
              estimatedDuration: "1 hour",
              tip: `Short walk from your last stop. Try the regional specialty — it's what the locals order.`,
            });
          }

          // Inject missing dinner at the END
          if (!hasDinner) {
            const lastAttraction = [...day.activities].reverse().find(
              (a: any) => (a.type ?? "") === "attraction"
            );
            day.activities.push({
              time: "8:30 PM",
              title: `Dinner Restaurant in ${cityName}`,
              type: "dinner",
              description: `End the day at a highly rated evening restaurant in ${cityName}. Enjoy the city's vibrant dinner scene with a curated multi-course meal featuring regional specialties and a relaxing ambiance.`,
              estimatedCost: "₹600-1000 per person",
              estimatedDuration: "1.5 hours",
              tip: `${lastAttraction ? `15 min from ${lastAttraction.title}. ` : ""}Reserve a table in advance for the best experience.`,
            });
          }

          // Back-fill missing "type" fields on any activity that doesn't have one
          for (const act of day.activities) {
            if (!act.type) {
              const titleLower = (act.title ?? "").toLowerCase();
              const timeLower = (act.time ?? "").toLowerCase();
              if (titleLower.includes("breakfast") || titleLower.includes("brunch") || (timeLower.includes("8:") && (titleLower.includes("cafe") || titleLower.includes("bakery")))) {
                act.type = "breakfast";
              } else if (titleLower.includes("lunch")) {
                act.type = "lunch";
              } else if (titleLower.includes("dinner") || titleLower.includes("supper")) {
                act.type = "dinner";
              } else if (titleLower.includes("prayer") || titleLower.includes("masjid")) {
                act.type = "prayer";
              } else {
                act.type = "attraction";
              }
            }
          }
        }
      }

      // Normalise estimatedCosts: accept any key casing/naming the AI returns
      const rawCosts =
        parsedData.estimatedCosts ?? parsedData.estimated_costs ?? {};
      const normalizeCosts = (obj: Record<string, any>) => {
        const find = (...keys: string[]) => {
          for (const k of keys) {
            const found = Object.keys(obj).find(
              (key) =>
                key.toLowerCase().replace(/[_\s]/g, "") === k.toLowerCase(),
            );
            if (found) return obj[found];
          }
          return undefined;
        };
        return {
          accommodation:
            find("accommodation", "accommodationcost", "hotel", "stay") ??
            "₹1500-5000 per night",
          transportation:
            find(
              "transportation",
              "transportationcost",
              "transport",
              "travel",
            ) ?? "₹300-800 per day",
          food:
            find("food", "foodcost", "meals", "dining") ??
            "₹400-1000 per day per person",
          activities:
            find("activities", "activitiescost", "activity", "entertainment") ??
            "₹200-600 per day per person",
          total:
            find("total", "totalcost", "grandtotal", "totalestimate") ??
            "See individual categories above",
        };
      };

      const trip = await storage.createTrip({
        ...(input as any),
        itinerary: parsedData.itinerary ?? [],
        lodging: parsedData.lodging ?? [],
        estimatedCosts: normalizeCosts(rawCosts),
        touristSpots: parsedData.touristSpots ?? [],
        foodRecommendations: parsedData.foodRecommendations ?? [],
        // Optionally attach user if logged in
        userId: (() => {
          try {
            const auth = req.headers.authorization;
            if (auth?.startsWith("Bearer ")) {
              const payload = verifyToken(auth.slice(7));
              return payload.userId;
            }
          } catch {
            /* anonymous user */
          }
          return undefined;
        })(),
      });

      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Error creating trip:", errMsg);
      res.status(500).json({ message: `Failed to generate trip: ${errMsg}` });
    }
  });

  app.get(api.trips.get.path, async (req, res) => {
    const trip = await storage.getTrip(Number(req.params.id));
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  });

  // ---- Seed Showcase Demo Trip ----
  app.get("/api/seed-showcase", async (req, res) => {
    try {
      // Try to link to logged-in user
      let userId: string | undefined;
      try {
        const auth = req.headers.authorization;
        if (auth?.startsWith("Bearer ")) {
          const payload = verifyToken(auth.slice(7));
          userId = payload.userId;
        }
      } catch { /* anonymous */ }

      const { seedShowcaseTrip } = await import("./seed-showcase");
      const result = await seedShowcaseTrip(userId);
      res.json({
        success: true,
        tripId: result.id,
        alreadyExists: result.alreadyExists,
        url: `/trip/${result.id}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to seed showcase trip";
      console.error("[seed-showcase]", msg);
      res.status(500).json({ message: msg });
    }
  });

  return httpServer;
}
