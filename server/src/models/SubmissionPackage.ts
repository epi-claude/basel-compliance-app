import { db } from '../database/sqlite';
import { SubmissionPackage } from '../types';
import crypto from 'crypto';

export class SubmissionPackageModel {
  /**
   * Create a new submission package
   */
  static create(
    userId: string,
    title: string,
    description?: string
  ): SubmissionPackage {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO submission_packages (
        id, user_id, title, description, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userId, title, description || null, 'draft', now, now);

    return this.findById(id)!;
  }

  /**
   * Find package by ID
   */
  static findById(id: string): SubmissionPackage | null {
    const stmt = db.prepare('SELECT * FROM submission_packages WHERE id = ?');
    const row = stmt.get(id) as SubmissionPackage | undefined;
    return row || null;
  }

  /**
   * Find all packages for a user
   */
  static findByUserId(userId: string): SubmissionPackage[] {
    const stmt = db.prepare(`
      SELECT * FROM submission_packages
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `);
    return stmt.all(userId) as SubmissionPackage[];
  }

  /**
   * Find packages by status for a user
   */
  static findByUserIdAndStatus(
    userId: string,
    status: 'draft' | 'submitted' | 'archived'
  ): SubmissionPackage[] {
    const stmt = db.prepare(`
      SELECT * FROM submission_packages
      WHERE user_id = ? AND status = ?
      ORDER BY updated_at DESC
    `);
    return stmt.all(userId, status) as SubmissionPackage[];
  }

  /**
   * Update package
   */
  static update(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: 'draft' | 'submitted' | 'archived';
      submitted_at?: string;
    }
  ): SubmissionPackage | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.submitted_at !== undefined) {
      fields.push('submitted_at = ?');
      values.push(updates.submitted_at);
    }

    // Always update updated_at
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    values.push(id);

    const stmt = db.prepare(`
      UPDATE submission_packages
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Delete package (and all related records via cascade)
   */
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM submission_packages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count packages by status for a user
   */
  static countByUserIdAndStatus(
    userId: string,
    status: 'draft' | 'submitted' | 'archived'
  ): number {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM submission_packages
      WHERE user_id = ? AND status = ?
    `);
    const result = stmt.get(userId, status) as { count: number };
    return result.count;
  }

  /**
   * Get all packages (admin only)
   */
  static findAll(): SubmissionPackage[] {
    const stmt = db.prepare(`
      SELECT * FROM submission_packages
      ORDER BY updated_at DESC
    `);
    return stmt.all() as SubmissionPackage[];
  }

  /**
   * Check if user owns package
   */
  static isOwner(packageId: string, userId: string): boolean {
    const pkg = this.findById(packageId);
    return pkg?.user_id === userId;
  }
}
