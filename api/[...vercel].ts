import { VercelRequest, VercelResponse } from '@vercel/node';

// Use CommonJS require to avoid ESM extension resolution issues on Vercel
const serverlessExpressModule: any = require('@vendia/serverless-express');
const serverlessExpress = serverlessExpressModule.default || serverlessExpressModule;

// Require the Express app from the backend source (no .ts extension)
const appModule: any = require('../auth-backend/src/serverless');
const app = appModule.default || appModule;

const handler = serverlessExpress({ app });

export default (req: VercelRequest, res: VercelResponse) => handler(req, res);
