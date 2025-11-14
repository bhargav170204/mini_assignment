import app from "../auth-backend/dist/serverless.js";

export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
