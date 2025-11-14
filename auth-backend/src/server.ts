import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
const { connectDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// connect to DB
connectDatabase().catch((err: any) => {
  console.error('Error connecting to database:', err);
});

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
// For local development, just allow all origins – keeps things simple
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes – note the /api prefix here for local dev
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server (local only)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
