import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login, getMe, logout } from './controllers/authController';
const { connectDatabase } = require('./config/database');

dotenv.config();

// connect to DB (idempotent)
connectDatabase().catch((err) => {
	console.error('Error connecting to database in serverless entry:', err);
});

const app = express();
app.use(cors());
app.use(express.json());

// --- Define routes ---
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/me', getMe);
app.post('/api/auth/logout', logout);

// Export a callable handler for serverless platforms to avoid TypeScript callable-module issues
export function handler(req: any, res: any) {
	return (app as any)(req, res);
}

// --- Export as serverless function ---
export default app;
