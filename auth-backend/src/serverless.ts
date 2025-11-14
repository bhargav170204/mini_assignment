// auth-backend/src/serverless.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login, getMe, logout } from './controllers/authController';
const { connectDatabase } = require('./config/database');

dotenv.config();

// connect to DB (idempotent)
connectDatabase().catch((err: any) => {
  console.error('Error connecting to database in serverless entry:', err);
});

const app = express();

// CORS – safe for prod + local
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ IMPORTANT: NO /api prefix here.
// Vercel strips `/api` before hitting this function.
app.post('/auth/signup', signup);
app.post('/auth/login', login);
app.get('/auth/me', getMe);
app.post('/auth/logout', logout);

// Export the Express app for Vercel
export default app;
