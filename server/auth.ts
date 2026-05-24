import type { Collection } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface UserDocument {
    _id?: any;
    name: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
    createdAt: Date;
}

export interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: "user" | "admin";
}

function getJwtSecret(): string {
    return process.env.JWT_SECRET || "safarix_jwt_secret_change_me_in_production";
}

// ─── In-Memory Fallback Store ─────────────────────────────────────────────────
// Used automatically when MongoDB Atlas is unreachable (e.g. IP not whitelisted).
// Users are stored in RAM for the current server session, but we will always
// retry MongoDB on the next request to ensure data is permanently stored once available.
const inMemoryUsers = new Map<string, UserDocument & { _id: string }>();
let mongoAttempted = false;

// Pre-seed admin user in memory to avoid needing to register every dev server restart
(async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@safarix.com").toLowerCase();
        const hash = await bcrypt.hash("admin123", 10);
        inMemoryUsers.set(adminEmail, {
            _id: "mem_admin_seed",
            name: "Admin User",
            email: adminEmail,
            passwordHash: hash,
            role: "admin",
            createdAt: new Date()
        });
    } catch (e) {
        // Ignore
    }
})();

async function tryGetMongoCollection(): Promise<Collection<UserDocument>> {
    try {
        const { getMongoDb } = await import("./mongodb");
        const db = await getMongoDb();
        const collection = db.collection<UserDocument>("users");
        await collection.createIndex({ email: 1 }, { unique: true });
        
        mongoAttempted = false;
        return collection;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
            "[auth] CRITICAL ERROR: MongoDB unavailable. User data must be stored permanently. " +
            "Please ensure MongoDB Atlas is connected. Error:", msg.slice(0, 120)
        );
        throw new Error("Database unavailable. Please configure MongoDB to persist users.");
    }
}

export async function getUsersCollection(): Promise<Collection<UserDocument>> {
    return await tryGetMongoCollection();
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerUser(name: string, email: string, password: string): Promise<string> {
    const lowerEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@safarix.com").toLowerCase();
    const role: "user" | "admin" = lowerEmail === adminEmail ? "admin" : "user";



    const col = await tryGetMongoCollection();

    const existing = await col.findOne({ email: lowerEmail });
    if (existing) throw new Error("An account with this email already exists.");

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await col.insertOne({
        name, email: lowerEmail, passwordHash, role, createdAt: new Date()
    } as any);
    const userId = result.insertedId.toString();
    return jwt.sign({ userId, email: lowerEmail, name, role }, getJwtSecret(), { expiresIn: "7d" });
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<string> {
    const lowerEmail = email.toLowerCase();
    const col = await tryGetMongoCollection();

    const user = await col.findOne({ email: lowerEmail }) as any;

    if (!user) throw new Error("Invalid email or password.");
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid email or password.");

    const userId = (user._id as any).toString();
    return jwt.sign(
        { userId, email: user.email, name: user.name, role: user.role },
        getJwtSecret(),
        { expiresIn: "7d" }
    );
}

// ─── Token Verify ─────────────────────────────────────────────────────────────
export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, getJwtSecret()) as JWTPayload;
}

// ─── Google OAuth — Find or Create Without Password ────────────────────────────
export async function generateGoogleToken(email: string, name: string): Promise<string> {
    const lowerEmail = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@safarix.com").toLowerCase();
    const role: "user" | "admin" = lowerEmail === adminEmail ? "admin" : "user";
    const col = await tryGetMongoCollection();

    let user = await col.findOne({ email: lowerEmail });
    if (!user) {
        const crypto = await import("crypto");
        const bcryptLib = (await import("bcryptjs")).default;
        const randomPwd = crypto.randomBytes(32).toString("hex");
        const passwordHash = await bcryptLib.hash(randomPwd, 12);
        await col.insertOne({ name, email: lowerEmail, passwordHash, role, createdAt: new Date() } as any);
        user = await col.findOne({ email: lowerEmail });
    }
    const userId = (user!._id as any).toString();
    return jwt.sign({ userId, email: lowerEmail, name: user!.name, role: user!.role }, getJwtSecret(), { expiresIn: "7d" });
}

// ─── Admin helpers ────────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<Omit<UserDocument, "passwordHash">[]> {
    const col = await tryGetMongoCollection();
    return col.find({}, { projection: { passwordHash: 0 } }).toArray() as any;
}
