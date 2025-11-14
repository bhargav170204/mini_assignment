import app from '../auth-backend/src/serverless';

export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
