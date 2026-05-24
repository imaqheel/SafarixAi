import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  days: integer("days").notNull(),
  budget: text("budget").notNull(),
  travelers: text("travelers").notNull(),
  activities: text("activities").array().notNull(),
  options: jsonb("options").$type<{ halal?: boolean; vegetarian?: boolean; prayerTimes?: boolean; wheelchair?: boolean }>().notNull(),

  // AI Generated Content
  itinerary: jsonb("itinerary").$type<any>(),
  lodging: jsonb("lodging").$type<any>(),
  estimatedCosts: jsonb("estimated_costs").$type<any>(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  itinerary: true,
  lodging: true,
  estimatedCosts: true
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// ---- Auth Schemas ----
export const registerInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;