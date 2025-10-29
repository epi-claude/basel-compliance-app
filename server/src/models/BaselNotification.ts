import { db } from '../database/sqlite';
import { BaselNotification } from '../types';
import crypto from 'crypto';

export class BaselNotificationModel {
  /**
   * Create a new Basel notification for a package
   */
  static create(
    submissionPackageId: string,
    userId: string
  ): BaselNotification {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO basel_notifications (
        id, submission_package_id, created_by_user_id,
        status, progress_percentage, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, submissionPackageId, userId, 'draft', 0, now, now);

    return this.findById(id)!;
  }

  /**
   * Find notification by ID
   */
  static findById(id: string): BaselNotification | null {
    const stmt = db.prepare('SELECT * FROM basel_notifications WHERE id = ?');
    const row = stmt.get(id) as BaselNotification | undefined;
    return row || null;
  }

  /**
   * Find notification by package ID
   */
  static findByPackageId(packageId: string): BaselNotification | null {
    const stmt = db.prepare('SELECT * FROM basel_notifications WHERE submission_package_id = ?');
    const row = stmt.get(packageId) as BaselNotification | undefined;
    return row || null;
  }

  /**
   * Update notification fields
   */
  static update(
    id: string,
    updates: Partial<Omit<BaselNotification, 'id' | 'submission_package_id' | 'created_by_user_id' | 'created_at'>>
  ): BaselNotification | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    // Handle all possible field updates
    Object.keys(updates).forEach((key) => {
      if (key !== 'id' && key !== 'submission_package_id' && key !== 'created_by_user_id' && key !== 'created_at') {
        fields.push(`"${key}" = ?`);
        values.push((updates as any)[key]);
      }
    });

    if (fields.length === 0) return existing;

    // Always update updated_at
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    values.push(id);

    const stmt = db.prepare(`
      UPDATE basel_notifications
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Calculate progress percentage based on filled fields
   */
  static calculateProgress(notification: BaselNotification): number {
    const totalFields = 115; // Total number of Basel form fields
    let filledFields = 0;

    // Count non-null, non-empty fields (excluding metadata fields)
    const excludeKeys = ['id', 'submission_package_id', 'created_by_user_id', 'status', 'progress_percentage', 'created_at', 'updated_at'];

    Object.keys(notification).forEach((key) => {
      if (!excludeKeys.includes(key)) {
        const value = (notification as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          filledFields++;
        }
      }
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  /**
   * Update progress percentage
   */
  static updateProgress(id: string): BaselNotification | null {
    const notification = this.findById(id);
    if (!notification) return null;

    const progress = this.calculateProgress(notification);
    return this.update(id, { progress_percentage: progress });
  }

  /**
   * Delete notification
   */
  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM basel_notifications WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Check if user owns notification (via package)
   */
  static isOwner(notificationId: string, userId: string): boolean {
    const stmt = db.prepare(`
      SELECT bn.id
      FROM basel_notifications bn
      JOIN submission_packages sp ON bn.submission_package_id = sp.id
      WHERE bn.id = ? AND sp.user_id = ?
    `);
    const result = stmt.get(notificationId, userId);
    return !!result;
  }
}
