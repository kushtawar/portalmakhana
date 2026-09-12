import mongoose from "mongoose";

declare global {
  var __mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cache = globalThis.__mongooseCache ?? { conn: null, promise: null };
globalThis.__mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
