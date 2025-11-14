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

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(express.json());

// --- Define routes ---
// Notice: NO /api prefix here – Vercel already stripped it.
app.post('/auth/signup', signup);
app.post('/auth/login', login);
app.get('/auth/me', getMe);
app.post('/auth/logout', logout);

// Let Express handle the request/response directly
export default app;
