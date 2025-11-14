// api/auth.js

import app from "../auth-backend/dist/serverless.js";

export default function handler(req, res) {
  return app(req, res);
}
