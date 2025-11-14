# Auth Backend (Node.js + Express + Mongoose + MongoDB)

This backend uses TypeScript, Express and Mongoose (MongoDB). The project was converted from Prisma/Postgres to MongoDB for easier Vercel deployment.

Quick start

1. Install dependencies:
   ```bash
   cd auth-backend
   npm install
   ```

2. Set up environment:
   - Copy `.env.example` to `.env` and update `MONGODB_URI` (use MongoDB Atlas or a local MongoDB) and `JWT_SECRET`.

3. Start dev server:
   ```bash
   npm run dev
   ```

Notes
- Do not commit real credentials. For production on Vercel, set `MONGODB_URI` and `JWT_SECRET` in Project → Settings → Environment Variables.
