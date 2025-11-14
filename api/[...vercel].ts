import { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';

const app = require('../auth-backend/src/serverless.ts');

const handler = serverlessExpress({ app });

export default (req: VercelRequest, res: VercelResponse) => handler(req, res);
