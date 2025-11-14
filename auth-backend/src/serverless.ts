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

// Log every incoming request so we can see the real path in Vercel logs
app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ IMPORTANT: support BOTH with and without `/api` prefix
app.post(['/api/auth/signup', '/auth/signup'], signup);
app.post(['/api/auth/login', '/auth/login'], login);
app.get(['/api/auth/me', '/auth/me'], getMe);
app.post(['/api/auth/logout', '/auth/logout'], logout);

// Export the Express app for Vercel
export default app;
