// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const User = require('../models/User');
const { connectDatabase } = require('../config/database');

// ------------------------
// Generate JWT Token
// ------------------------
const generateToken = (userId: string): string => {
  const secretEnv = process.env.JWT_SECRET;
  if (!secretEnv) {
    // Fail early so you don't sign tokens with an empty secret
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  const secret = secretEnv as jwt.Secret;
  const expiresIn = (process.env.JWT_EXPIRE ?? '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign({ userId }, secret, { expiresIn });
};


// ------------------------
// Register User
// @route   POST /auth/signup
// @access  Public
// ------------------------
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectDatabase();
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
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and assign role
    const userDoc = new User({
      email,
      password: hashedPassword,
      fullName,
      role: (role as any) || 'user',
    });
    const saved = await userDoc.save();

    // Generate JWT
    const token = generateToken(saved.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: saved.id,
          email: saved.email,
          fullName: saved.fullName,
          role: saved.role,
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

// ------------------------
// Login User
// @route   POST /auth/login
// @access  Public
// ------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    await connectDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user with role
    const user = await User.findOne({ email }).exec();

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Validate password
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
          role: user.role,
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

// ------------------------
// Get Current User
// @route   GET /auth/me
// @access  Private
// ------------------------
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Defensive access in case global augmentation isn't picked up
    const maybeUser = (req as any).user;
    if (!maybeUser || !maybeUser.id) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const userId = String(maybeUser.id);
    await connectDatabase();
    const user = await User.findById(userId).select('id email fullName role createdAt updatedAt').exec();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.userRole?.role,
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

// ------------------------
// Logout User
// @route   POST /auth/logout
// @access  Private
// ------------------------
export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled on the client by removing the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
