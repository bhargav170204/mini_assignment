import { VercelRequest, VercelResponse } from '@vercel/node';

// CommonJS require to avoid ESM extension resolution issues on Vercel
// Loads @vendia/serverless-express with fallback for default export
const serverlessExpressModule: any = require('@vendia/serverless-express');
const serverlessExpress = serverlessExpressModule.default || serverlessExpressModule;

// Require Express app from backend (no .ts extension for Vercel TS resolution)
const appModule: any = require('../auth-backend/src/serverless');
const app = appModule.default || appModule;

// Wrap Express app with serverless handler
const handler = serverlessExpress({ app });

export default (req: VercelRequest, res: VercelResponse) => handler(req, res);
