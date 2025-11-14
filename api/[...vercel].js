// Pure CommonJS handler for Vercel serverless functions
const serverlessExpressModule = require('@vendia/serverless-express');
const serverlessExpress = serverlessExpressModule.default || serverlessExpressModule;

// Require Express app from backend
const appModule = require('../auth-backend/src/serverless');
const app = appModule.default || appModule;

// Wrap Express app with serverless handler
const handler = serverlessExpress({ app });

// Export as CommonJS handler
module.exports = (req, res) => handler(req, res);
