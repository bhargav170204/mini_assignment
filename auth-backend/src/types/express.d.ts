// --- Type augmentation (quick fix inside this file) ---
declare global {
  namespace Express {
    interface User {
      id: string;
      role?: string;
      email?: string;
      fullName?: string;
    }
    interface Request {
      user?: User;
    }
  }
}
// make this file a module so augmentation is applied
export {};
// ------------------------------------------------------
