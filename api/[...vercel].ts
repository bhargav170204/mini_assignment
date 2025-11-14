// api/[...vercel].ts
// Reuse the Express app exported from auth-backend/src/serverless.ts
import app from '../auth-backend/src/serverless.js';

// Vercel expects a default-exported handler: (req, res) => ...
export default function handler(req: any, res: any) {
  // Express apps are themselves request handlers: app(req, res)
  return app(req, res);
}
