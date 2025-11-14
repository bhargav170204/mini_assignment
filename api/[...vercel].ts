// api/[...vercel].ts
// Reuse the Express app exported from auth-backend/src/serverless.ts
// Use CommonJS require and `any` to avoid TypeScript callable-type issues during Vercel build
const appModule: any = require('../auth-backend/src/serverless.js');
const app: any = appModule && (appModule.default || appModule);

// Vercel expects a default-exported handler: (req, res) => ...
export default function handler(req: any, res: any) {
  // Express apps are themselves request handlers: app(req, res)
  // Call the Express app directly. Cast to any to bypass TS callable checks.
  return app(req, res);
}
