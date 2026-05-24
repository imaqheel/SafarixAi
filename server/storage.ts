import { type InsertTrip, type Trip } from "@shared/schema";

export interface IStorage {
  createTrip(trip: InsertTrip & { itinerary: any; lodging: any; estimatedCosts: any; userId?: string }): Promise<Trip>;
  getTrip(id: number): Promise<Trip | undefined>;
  getUserTrips(userId: string): Promise<Trip[]>;
  // Admin methods — always go through the same storage layer
  getAllTrips(): Promise<Trip[]>;
  getTripCount(): Promise<number>;
  deleteTrip(id: number): Promise<boolean>;
}

// In-memory storage — works without any database
class MemoryStorage implements IStorage {
  private trips = new Map<number, Trip>();

  async createTrip(tripData: InsertTrip & { itinerary: any; lodging: any; estimatedCosts: any; userId?: string }): Promise<Trip> {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const trip: Trip = {
      id,
      ...tripData,
      createdAt: new Date(),
    };
    this.trips.set(id, trip);
    console.log(`[storage] Trip ${id} saved to memory`);
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter((t: any) => t.userId === userId);
  }

  async getAllTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values()).sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }

  async getTripCount(): Promise<number> {
    return this.trips.size;
  }

  async deleteTrip(id: number): Promise<boolean> {
    return this.trips.delete(id);
  }
}

// MongoDB storage — used when MONGODB_URI is set and server is reachable
class DatabaseStorage implements IStorage {
  async createTrip(tripData: InsertTrip & { itinerary: any; lodging: any; estimatedCosts: any; userId?: string }): Promise<Trip> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    const trip: Trip = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...tripData,
      createdAt: new Date(),
    };
    await collection.insertOne({ ...trip, createdAt: trip.createdAt ?? new Date() } as any);
    console.log(`[storage] Trip ${trip.id} saved to MongoDB`);
    return trip;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    const trip = await collection.findOne({ id });
    return trip ?? undefined;
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    const trips = await collection.find({ userId } as any).sort({ createdAt: -1 }).toArray();
    return trips as any;
  }

  async getAllTrips(): Promise<Trip[]> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    const trips = await collection.find({}).sort({ createdAt: -1 }).limit(200).toArray();
    return trips as any;
  }

  async getTripCount(): Promise<number> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    return collection.countDocuments();
  }

  async deleteTrip(id: number): Promise<boolean> {
    const { getTripsCollection } = await import("./mongodb");
    const collection = await getTripsCollection();
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}

// Hybrid: try MongoDB first; fall back to memory for that single operation.
// Unlike before, we do NOT permanently switch to memory — every call retries
// MongoDB so connectivity can auto-recover after a brief hiccup.
class HybridStorage implements IStorage {
  private memStorage = new MemoryStorage();
  private dbStorage = new DatabaseStorage();
  private failCount = 0;

  private logFallback(method: string, err: unknown) {
    this.failCount++;
    // Only log a warning every 5th failure to avoid spamming the console
    if (this.failCount <= 2 || this.failCount % 5 === 0) {
      console.warn(`[storage] MongoDB unavailable for ${method}, using in-memory fallback:`, (err as Error).message?.slice(0, 100));
    }
  }

  async createTrip(tripData: InsertTrip & { itinerary: any; lodging: any; estimatedCosts: any; userId?: string }): Promise<Trip> {
    try {
      const result = await this.dbStorage.createTrip(tripData);
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("createTrip", err);
      return this.memStorage.createTrip(tripData);
    }
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    try {
      const result = await this.dbStorage.getTrip(id);
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("getTrip", err);
      return this.memStorage.getTrip(id);
    }
  }

  async getUserTrips(userId: string): Promise<Trip[]> {
    try {
      const result = await this.dbStorage.getUserTrips(userId);
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("getUserTrips", err);
      return this.memStorage.getUserTrips(userId);
    }
  }

  async getAllTrips(): Promise<Trip[]> {
    try {
      const result = await this.dbStorage.getAllTrips();
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("getAllTrips", err);
      return this.memStorage.getAllTrips();
    }
  }

  async getTripCount(): Promise<number> {
    try {
      const result = await this.dbStorage.getTripCount();
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("getTripCount", err);
      return this.memStorage.getTripCount();
    }
  }

  async deleteTrip(id: number): Promise<boolean> {
    try {
      const result = await this.dbStorage.deleteTrip(id);
      this.failCount = 0;
      return result;
    } catch (err) {
      this.logFallback("deleteTrip", err);
      return this.memStorage.deleteTrip(id);
    }
  }
}

export const storage = new DatabaseStorage();