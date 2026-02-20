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
  options: jsonb("options").$type<{ halal?: boolean; vegetarian?: boolean }>().notNull(),
  
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