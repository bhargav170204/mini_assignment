// api/[...vercel].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../auth-backend/src/serverless.js';

// Forward the Vercel request/response into the Express app
export default function handler(req: VercelRequest, res: VercelResponse) {
  return (app as any)(req, res);
}
