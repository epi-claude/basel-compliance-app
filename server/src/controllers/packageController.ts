import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { SubmissionPackageModel } from '../models/SubmissionPackage';

/**
 * Get all packages for the current user
 * GET /api/packages
 */
export function getPackages(req: AuthRequest, res: Response) {
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

    const packages = SubmissionPackageModel.findByUserId(req.user.id);

    // Get counts for each status
    const draftCount = SubmissionPackageModel.countByUserIdAndStatus(req.user.id, 'draft');
    const submittedCount = SubmissionPackageModel.countByUserIdAndStatus(req.user.id, 'submitted');
    const archivedCount = SubmissionPackageModel.countByUserIdAndStatus(req.user.id, 'archived');

    res.status(200).json({
      success: true,
      data: {
        packages,
        counts: {
          draft: draftCount,
          submitted: submittedCount,
          archived: archivedCount,
          total: packages.length,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to get packages',
        code: 'SERVER_ERROR',
      },
    });
  }
}

/**
 * Get a single package by ID
 * GET /api/packages/:id
 */
export function getPackageById(req: AuthRequest, res: Response) {
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

    const { id } = req.params;
    const pkg = SubmissionPackageModel.findById(id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Package not found',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check ownership
    if (pkg.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to get package',
        code: 'SERVER_ERROR',
      },
    });
  }
}

/**
 * Create a new package
 * POST /api/packages
 */
export function createPackage(req: AuthRequest, res: Response) {
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

    const { title, description } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Title is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Create package
    const pkg = SubmissionPackageModel.create(req.user.id, title, description);

    res.status(201).json({
      success: true,
      data: pkg,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to create package',
        code: 'SERVER_ERROR',
      },
    });
  }
}

/**
 * Update a package
 * PUT /api/packages/:id
 */
export function updatePackage(req: AuthRequest, res: Response) {
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

    const { id } = req.params;
    const { title, description, status } = req.body;

    // Check if package exists and user owns it
    if (!SubmissionPackageModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN',
        },
      });
    }

    // Update package
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'submitted') {
        updates.submitted_at = new Date().toISOString();
      }
    }

    const pkg = SubmissionPackageModel.update(id, updates);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Package not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to update package',
        code: 'SERVER_ERROR',
      },
    });
  }
}

/**
 * Delete a package
 * DELETE /api/packages/:id
 */
export function deletePackage(req: AuthRequest, res: Response) {
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

    const { id } = req.params;

    // Check if package exists and user owns it
    if (!SubmissionPackageModel.isOwner(id, req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'FORBIDDEN',
        },
      });
    }

    const deleted = SubmissionPackageModel.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Package not found',
          code: 'NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Package deleted successfully',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to delete package',
        code: 'SERVER_ERROR',
      },
    });
  }
}
