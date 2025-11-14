// Pure CommonJS handler for Vercel serverless functions.
// Loads @vendia/serverless-express and wraps the Express app.
const serverlessExpressModule = require('@vendia/serverless-express');
const serverlessExpress = serverlessExpressModule.default || serverlessExpressModule;

// Require Express app from backend serverless entry point
const appModule = require('../auth-backend/src/serverless');
const app = appModule.default || appModule;

// Wrap Express app with serverless handler for Vercel
const handler = serverlessExpress({ app });

// Export as CommonJS handler function
module.exports = (req, res) => handler(req, res);
