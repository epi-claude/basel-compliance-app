import { db } from '../database/sqlite';
import { User } from '../types/index';
import crypto from 'crypto';

export class UserModel {
  /**
   * Create a new user
   */
  static create(username: string, passwordHash: string, email?: string, fullName?: string, organization?: string): User {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, email, full_name, organization, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, username, passwordHash, email || null, fullName || null, organization || null, now, now);

    return this.findById(id)!;
  }

  /**
   * Find user by ID
   */
  static findById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  /**
   * Find user by username
   */
  static findByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    return user || null;
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    return user || null;
  }

  /**
   * Update user
   */
  static update(id: string, data: Partial<User>): User {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(data.full_name);
    }
    if (data.organization !== undefined) {
      updates.push('organization = ?');
      values.push(data.organization);
    }
    if (data.password_hash !== undefined) {
      updates.push('password_hash = ?');
      values.push(data.password_hash);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id)!;
  }

  /**
   * Delete user
   */
  static delete(id: string): void {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Get all users (for admin)
   */
  static findAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  }
}
