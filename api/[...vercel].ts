import { configure } from '@vendia/serverless-express';
import app from '../auth-backend/src/serverless.js';

// Configure serverless express handler with the Express app
const serverlessExpress = configure({ app });

// Export default handler for Vercel
export default serverlessExpress;
