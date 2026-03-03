import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createBackup,
  restoreBackup,
  getBackupSize,
  getBackupSummary,
} from '../services/backupService.js';

const router = express.Router();

/**
 * POST /api/backups/create
 * Create a full database backup
 * Admin only
 */
router.post('/create', authenticateToken, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const backup = await createBackup();
    const size = await getBackupSize(backup);
    const summary = getBackupSummary(backup);

    res.json({
      success: true,
      message: 'Backup created successfully',
      summary,
      size,
      timestamp: backup.timestamp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/backups/restore
 * Restore database from backup
 * Admin only - DANGEROUS OPERATION
 */
router.post(
  '/restore',
  authenticateToken,
  authorizeRole('ADMIN'),
  authorize('BACKUP_RESTORE'),
  async (req, res) => {
    try {
      const { backup } = req.body;

      if (!backup) {
        return res.status(400).json({
          success: false,
          message: 'No backup data provided',
        });
      }

      // Additional confirmation check
      if (req.body.confirmRestore !== true) {
        return res.status(400).json({
          success: false,
          message: 'Restore must be confirmed with confirmRestore=true',
        });
      }

      const result = await restoreBackup(backup);

      res.json({
        success: true,
        message: result.message,
        restoredAt: result.restoredAt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Restore failed',
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/backups/status
 * Get backup system status
 * Admin only
 */
router.get('/status', authenticateToken, authorizeRole('ADMIN'), async (req, res) => {
  try {
    const backup = await createBackup();
    const size = await getBackupSize(backup);
    const summary = getBackupSummary(backup);

    res.json({
      success: true,
      backupStatus: 'operational',
      lastBackup: new Date().toISOString(),
      summary,
      size,
      estimatedRestoreTime: '5-10 minutes',
      retentionPolicy: '90 days',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      backupStatus: 'error',
      message: error.message,
    });
  }
});

/**
 * GET /api/backups/health
 * Check backup system health
 * Public endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const backup = await createBackup();
    const summary = getBackupSummary(backup);

    res.json({
      success: true,
      status: 'healthy',
      collections: summary.collections,
      totalRecords: summary.totalRecords,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

export default router;
