import { MongoClient, type Collection, type Db } from "mongodb";
import type { Trip } from "@shared/schema";

type TripDocument = Omit<Trip, "createdAt"> & {
  createdAt: Date;
};

let client: MongoClient | null = null;
let database: Db | null = null;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be set. Example: mongodb+srv://user:pass@cluster/db");
  }
  return uri;
}

export async function getMongoDb(): Promise<Db> {
  if (database) {
    return database;
  }

  const uri = getMongoUri();
  const dbName = process.env.MONGODB_DB || "travel_ai_planner";

  // On Windows, the Node.js TLS stack sometimes fails SNI/certificate
  // verification with MongoDB Atlas (SSL alert 80). Setting TLS_INSECURE=true
  // in .env bypasses strict certificate checks for local development.
  const insecure = process.env.TLS_INSECURE === "true";

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
    socketTimeoutMS: 45000,
    ...(insecure ? { tlsInsecure: true } : {}),
  });

  await client.connect();
  database = client.db(dbName);

  console.log("[mongodb] Connected to MongoDB Atlas:", dbName);
  return database;
}

export async function getTripsCollection(): Promise<Collection<TripDocument>> {
  const db = await getMongoDb();
  const collection = db.collection<TripDocument>("trips");
  await collection.createIndex({ id: 1 }, { unique: true });
  return collection;
}
