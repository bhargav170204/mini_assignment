// api/[...vercel].ts
// Import the named callable `handler` from the backend serverless entry.
// Using the explicit .js extension is required for node16/nodenext resolution on Vercel.
import { handler as appHandler } from '../auth-backend/src/serverless.js';

// Re-export the handler for Vercel to call directly.
export default appHandler;
