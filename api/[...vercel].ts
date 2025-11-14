import { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import app from '../auth-backend/src/serverless';

const handler = serverlessExpress({ app });

export default (req: VercelRequest, res: VercelResponse) => handler(req, res);
