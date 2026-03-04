import mongoose from "mongoose";

interface MongoCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global to hold the cache across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: MongoCache | undefined;
}

const cached: MongoCache = global._mongoCache ?? { conn: null, promise: null };
global._mongoCache = cached;

/** Returns true if MONGODB_URI is configured */
export function isMongoAvailable(): boolean {
  return !!process.env.MONGODB_URI;
}

/**
 * Connects to MongoDB. Returns null (instead of throwing) when
 * MONGODB_URI is not set, so API routes can degrade gracefully.
 */
export async function connectToMongo(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[mongodb] MONGODB_URI is not set — DB features disabled.");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // fail fast instead of default 30s
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // Reset so the next request retries rather than hanging forever
    cached.promise = null;
    cached.conn = null;
    console.error("[mongodb] Connection failed:", err);
    return null;
  }
}
