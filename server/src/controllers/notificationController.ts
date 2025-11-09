import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { BaselNotificationModel } from '../models/BaselNotification';
import { SubmissionPackageModel } from '../models/SubmissionPackage';
import { PDFService } from '../services/pdfService';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get notification by package ID
 * GET /api/notifications/package/:packageId
 */
export function getNotificationByPackageId(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { packageId } = req.params;

    // Check if package exists and user owns it
    if (!SubmissionPackageModel.isOwner(packageId, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    let notification = BaselNotificationModel.findByPackageId(packageId);

    // If notification doesn't exist, create it
    if (!notification) {
      notification = BaselNotificationModel.create(packageId, req.user.id);
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get notification', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Get notification by ID
 * GET /api/notifications/:id
 */
export function getNotificationById(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = req.params;
    const notification = BaselNotificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Check ownership
    if (!BaselNotificationModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to get notification', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Update notification fields
 * PUT /api/notifications/:id
 */
export function updateNotification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check ownership
    if (!BaselNotificationModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    // Update notification
    const notification = BaselNotificationModel.update(id, updates);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Update progress percentage
    const updatedNotification = BaselNotificationModel.updateProgress(id);

    res.status(200).json({
      success: true,
      data: updatedNotification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to update notification', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Auto-save notification fields (partial update)
 * PATCH /api/notifications/:id/autosave
 */
export function autoSaveNotification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check ownership
    if (!BaselNotificationModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    // Update notification
    const notification = BaselNotificationModel.update(id, updates);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Update progress percentage
    const updatedNotification = BaselNotificationModel.updateProgress(id);

    // Return minimal response for auto-save
    res.status(200).json({
      success: true,
      data: {
        id: updatedNotification!.id,
        progress_percentage: updatedNotification!.progress_percentage,
        updated_at: updatedNotification!.updated_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Auto-save failed', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Load test data into notification
 * POST /api/notifications/:id/load-test-data
 */
export function loadTestData(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      });
    }

    const { id } = req.params;

    // Check ownership
    if (!BaselNotificationModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    // Read test data JSON file
    const testDataPath = path.join(__dirname, '../test-data/basel-test-data.json');
    const testDataRaw = fs.readFileSync(testDataPath, 'utf8');
    const testDataJson = JSON.parse(testDataRaw);
    const testData = testDataJson.data;

    // Update notification with test data
    const notification = BaselNotificationModel.update(id, testData);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Update progress percentage
    const updatedNotification = BaselNotificationModel.updateProgress(id);

    res.status(200).json({
      success: true,
      data: updatedNotification,
      message: `Test data loaded: ${testDataJson.scenario}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to load test data', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Generate filled PDF for notification
 * GET /api/notifications/:id/generate-pdf
 */
export async function generatePDF(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get notification
    const notification = BaselNotificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Check access
    if (notification.created_by_user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    console.log(`📄 Generating PDF for notification ${id}...`);

    // Generate PDF
    const pdfBuffer = await PDFService.fillBaselNotificationPDF(notification);

    console.log(`✅ PDF generated successfully (${pdfBuffer.length} bytes)`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Basel_Notification_${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to generate PDF', code: 'SERVER_ERROR' },
    });
  }
}

/**
 * Generate custom readable PDF for notification
 * GET /api/notifications/:id/generate-custom-pdf
 */
export async function generateCustomPDF(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get notification
    const notification = BaselNotificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found', code: 'NOT_FOUND' },
      });
    }

    // Check access
    if (notification.created_by_user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', code: 'FORBIDDEN' },
      });
    }

    console.log(`📄 Generating custom PDF for notification ${id}...`);

    // Generate custom PDF
    const pdfBuffer = await PDFService.generateCustomPDF(notification);

    console.log(`✅ Custom PDF generated successfully (${pdfBuffer.length} bytes)`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Basel_Notification_Custom_${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('❌ Custom PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Failed to generate custom PDF', code: 'SERVER_ERROR' },
    });
  }
}
