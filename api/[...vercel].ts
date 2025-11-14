import { VercelRequest, VercelResponse } from '@vercel/node';

// CommonJS require to avoid ESM extension resolution issues on Vercel
const serverlessExpressModule: any = require('@vendia/serverless-express');
const serverlessExpress = serverlessExpressModule.default || serverlessExpressModule;

// Require Express app from backend (no .ts extension for Vercel TS resolution)
const appModule: any = require('../auth-backend/src/serverless');
const app = appModule.default || appModule;

// Wrap Express app with serverless handler
const handler = serverlessExpress({ app });

// Export as CommonJS to avoid module resolution issues
module.exports = (req: VercelRequest, res: VercelResponse) => handler(req, res);
