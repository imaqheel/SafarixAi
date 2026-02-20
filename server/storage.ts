import { db } from "./db";
import { trips, type InsertTrip, type Trip } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createTrip(trip: InsertTrip & { itinerary: any, lodging: any, estimatedCosts: any }): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createTrip(tripData: InsertTrip & { itinerary: any, lodging: any, estimatedCosts: any }): Promise<Trip> {
    const [trip] = await db.insert(trips).values(tripData).returning();
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }
}

export const storage = new DatabaseStorage();