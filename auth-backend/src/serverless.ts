import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login, getMe, logout } from './controllers/authController';
const { connectDatabase } = require('./config/database');

dotenv.config();

// connect to DB (idempotent for serverless)
connectDatabase().catch((err: any) => {
  console.error('Error connecting to database in serverless entry:', err);
});

const app = express();

// Log incoming requests (helps in Vercel logs while debugging)
app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

// CORS – allow all origins (no cookies, so this is fine)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT:
// Support both `/api/auth/...` and `/auth/...` paths so it works
// regardless of how Vercel forwards the path.
app.post(['/api/auth/signup', '/auth/signup'], signup);
app.post(['/api/auth/login', '/auth/login'], login);
app.get(['/api/auth/me', '/auth/me'], getMe);
app.post(['/api/auth/logout', '/auth/logout'], logout);

// Export Express app for serverless handler
export default app;
