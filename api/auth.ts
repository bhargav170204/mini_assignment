// api/auth.ts
// Vercel serverless API entry for Express backend

import app from '../auth-backend/src/serverless.js';  // <-- MUST USE .js

export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
