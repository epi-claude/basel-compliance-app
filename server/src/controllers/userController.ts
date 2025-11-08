import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserModel } from '../models/User';
import bcrypt from 'bcrypt';

/**
 * Get current user profile
 * GET /api/users/me
 */
export function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const user = UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    }

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get user', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Update current user profile
 * PUT /api/users/me
 */
export function updateCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { email, full_name, organization, username } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email already in use', code: 'EMAIL_EXISTS' },
        });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          error: { message: 'Username already in use', code: 'USERNAME_EXISTS' },
        });
      }
    }

    // Update user
    const updatedUser = UserModel.update(req.user.id, {
      email,
      full_name,
      organization,
    });

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update user', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Change password
 * POST /api/users/me/change-password
 */
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password and new password are required', code: 'VALIDATION_ERROR' },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password must be at least 6 characters', code: 'VALIDATION_ERROR' },
      });
    }

    // Get user with password hash
    const user = UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect', code: 'INVALID_PASSWORD' },
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    UserModel.update(req.user.id, { password_hash: newPasswordHash });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to change password', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Delete current user account
 * DELETE /api/users/me
 */
export function deleteCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    UserModel.delete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to delete account', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Get all users (admin only)
 * GET /api/users
 */
export function getAllUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required', code: 'FORBIDDEN' },
      });
    }

    const users = UserModel.findAll();

    // Remove password hashes from response
    const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user);

    res.status(200).json({
      success: true,
      data: usersWithoutPasswords,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get users', code: 'SERVER_ERROR' },
    });
  }
}
