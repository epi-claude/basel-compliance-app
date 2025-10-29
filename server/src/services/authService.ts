import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { User, JwtPayload } from '../types/index';
import { config } from '../config';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    username: string,
    password: string,
    email?: string,
    fullName?: string,
    organization?: string
  ): Promise<{ user: Omit<User, 'password_hash'> }> {
    // Validate username
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    // Validate password
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if username already exists
    const existingUser = UserModel.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email already exists
    if (email) {
      const existingEmail = UserModel.findByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = UserModel.create(username, passwordHash, email, fullName, organization);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }

  /**
   * Login user
   */
  static async login(
    username: string,
    password: string
  ): Promise<{ token: string; user: Omit<User, 'password_hash'> }> {
    // Find user
    const user = UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration } as jwt.SignOptions
    );

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID (for JWT verification)
   */
  static getUserById(userId: string): Omit<User, 'password_hash'> | null {
    const user = UserModel.findById(userId);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
