import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;

if (!mongoUri) {
  console.warn("❌ No MONGODB_URI or DATABASE_URL provided.");
}

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  if (!mongoUri) {
    throw new Error("MONGODB_URI (or DATABASE_URL) is not configured");
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export default mongoose;
