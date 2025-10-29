import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No authorization token provided',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Extract token (format: "Bearer <token>")
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid authorization format. Use: Bearer <token>',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const token = parts[1];

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Get user
    const user = AuthService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        message: error.message || 'Authentication failed',
        code: 'UNAUTHORIZED',
      },
    });
  }
}
