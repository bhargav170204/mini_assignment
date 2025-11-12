// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
// --- local type augmentation (paste right after imports) ---
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
// turn this file into a module so the augmentation is applied
export {};
// -----------------------------------------------------------


interface JwtPayload {
  userId?: string;
  iat?: number;
  exp?: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT secret is not configured');
      res.status(500).json({ success: false, message: 'Server configuration error' });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      console.error('JWT verification failed:', err);
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    if (!decoded?.userId) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { userRole: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Attach user to request (type augmentation required)
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.userRole?.role ?? 'user',
    };

    next();
  } catch (error) {
    console.error('Protect middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // If no roles were provided to the middleware, allow any authenticated user.
    if (roles.length > 0 && !roles.includes(req.user.role ?? '')) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role ?? 'unknown'} is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};
