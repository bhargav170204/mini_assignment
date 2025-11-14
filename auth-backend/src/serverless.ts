import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// IMPORTANT: use .js extensions because Vercel uses NodeNext
import { signup, login, getMe, logout } from "./controllers/authController.js";
import { connectDatabase } from "./config/database.js";

dotenv.config();

// Ensure database connects before using routes
await connectDatabase();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    credentials: true,
  })
);

app.use(express.json());

// ROUTES
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.get("/api/auth/me", getMe);
app.post("/api/auth/logout", logout);

// Export for Vercel serverless
export default app;
