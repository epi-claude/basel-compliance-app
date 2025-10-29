import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response) {
  try {
    const { username, password, email, full_name, organization } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username and password are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Register user
    const result = await AuthService.register(username, password, email, full_name, organization);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message || 'Registration failed',
        code: 'REGISTRATION_ERROR',
      },
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Username and password are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Login user
    const result = await AuthService.login(username, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Login failed',
        code: 'AUTHENTICATION_ERROR',
      },
    });
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Get full user details
    const user = AuthService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to get user',
        code: 'SERVER_ERROR',
      },
    });
  }
}
