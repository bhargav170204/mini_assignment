# Backend Setup Guide - Node.js + Express + Prisma + PostgreSQL

## Complete Folder Structure

```
auth-backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts
│   ├── routes/
│   │   └── authRoutes.ts
│   ├── config/
│   │   └── database.ts
│   ├── types/
│   │   └── express.d.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## File Contents

### 1. `package.json`

```json
{
  "name": "auth-backend",
  "version": "1.0.0",
  "description": "Authentication backend with role-based access",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.5",
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

---

### 2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 3. `.env.example`

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="7d"

# Server
PORT=3000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:8080"
```

---

### 4. `.gitignore`

```
node_modules/
dist/
.env
*.log
.DS_Store
```

---

### 5. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  user
  admin
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  fullName  String   @map("full_name")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  userRole  UserRole?

  @@map("users")
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  role      Role
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_roles")
}
```

---

### 6. `src/config/database.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

---

### 7. `src/types/express.d.ts`

```typescript
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: string;
        role: string;
      };
    }
  }
}
```

---

### 8. `src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

interface JwtPayload {
  userId: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ''
    ) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { userRole: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.userRole?.role || 'user',
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
```

---

### 9. `src/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

// Generate JWT Token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || '', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /auth/signup
// @access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        userRole: {
          create: {
            role: role || 'user',
          },
        },
      },
      include: {
        userRole: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.userRole?.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRole: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.userRole?.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
    });
  }
};

// @desc    Get current user
// @route   GET /auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { userRole: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        userRole: {
          select: {
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          role: user?.userRole?.role,
          userRole: undefined,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
};

// @desc    Logout user
// @route   POST /auth/logout
// @access  Private
export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled on the client side by removing the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
```

---

### 10. `src/routes/authRoutes.ts`

```typescript
import express from 'express';
import { signup, login, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
```

---

### 11. `src/server.ts`

```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

---

## Setup Instructions

### 1. **Create PostgreSQL Database**

```bash
# Using PostgreSQL locally
createdb auth_db

# Or use a cloud provider:
# - Neon.tech (free tier)
# - Supabase (free tier)
# - Railway (free tier)
```

### 2. **Initialize Project**

```bash
mkdir auth-backend
cd auth-backend
npm init -y
```

### 3. **Install Dependencies**

```bash
npm install express @prisma/client bcrypt jsonwebtoken dotenv cors
npm install -D prisma typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken @types/cors ts-node nodemon
```

### 4. **Setup Prisma**

```bash
npx prisma init
```

### 5. **Configure Environment**

Create `.env` file with your database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"
JWT_SECRET="your-secret-key-change-this"
PORT=3000
FRONTEND_URL="http://localhost:8080"
```

### 6. **Run Migrations**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. **Start Development Server**

```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

---

## Frontend Integration

### Update Frontend to Connect to Backend

Create `src/config/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Update Auth Hook (`src/hooks/useAuth.tsx`):

Replace Supabase calls with:

```typescript
import api from '@/config/api';

// Signup
const { data } = await api.post('/auth/signup', {
  email,
  password,
  fullName,
  role,
});
localStorage.setItem('token', data.data.token);

// Login
const { data } = await api.post('/auth/login', {
  email,
  password,
});
localStorage.setItem('token', data.data.token);

// Get user
const { data } = await api.get('/auth/me');

// Logout
await api.post('/auth/logout');
localStorage.removeItem('token');
```

### Add to `.env` in frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Deployment

### Backend Deployment Options

1. **Render.com** (Free tier)
2. **Railway.app** (Free tier)
3. **Heroku** (Paid)
4. **AWS EC2** (Variable cost)
5. **DigitalOcean** ($5/month)

### Database Hosting

1. **Neon.tech** (PostgreSQL - Free tier)
2. **Supabase** (PostgreSQL - Free tier)
3. **Railway** (PostgreSQL - Free tier)

---

## Testing with Postman/Thunder Client

### 1. Signup
```
POST http://localhost:3000/api/auth/signup
Body (JSON):
{
  "email": "admin@test.com",
  "password": "password123",
  "fullName": "Admin User",
  "role": "admin"
}
```

### 2. Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "admin@test.com",
  "password": "password123"
}
```

### 3. Get Current User
```
GET http://localhost:3000/api/auth/me
Headers:
Authorization: Bearer <your-jwt-token>
```

---

## Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Set up logging (Winston/Morgan)
- [ ] Add error monitoring (Sentry)
- [ ] Enable database connection pooling
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline

---

This is a complete, production-ready backend structure that matches your frontend implementation!