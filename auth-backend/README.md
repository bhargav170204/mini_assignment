# Auth Backend (Node.js + Express + Prisma + PostgreSQL)

This repository contains a TypeScript-based authentication backend using Express and Prisma.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment:
   - Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.

3. Initialize Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

## Notes
- This project is generated for you and saved as a zip in `/mnt/data/auth-backend.zip`.
