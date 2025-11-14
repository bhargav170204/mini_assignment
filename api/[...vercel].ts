// api/[...vercel].ts

// Import the default Express app from the serverless entry.
// Note: .js extension is required for Node16/NodeNext resolution on Vercel.
import app from '../auth-backend/src/serverless.js';

// Vercel will call this default-exported handler.
// We just pass the req/res into the Express app.
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
