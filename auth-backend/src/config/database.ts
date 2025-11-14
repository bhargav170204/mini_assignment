import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

export async function connectDatabase() {
  if (!uri) {
    console.error("❌ No MongoDB URI provided");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB error:", error);
  }
}

export default mongoose;
