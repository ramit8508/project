import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = globalWithMongoose.mongoose ?? { conn: null, promise: null };
globalWithMongoose.mongoose = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
