import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

await connectDatabase();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "*",
    credentials: true
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

export default app;
