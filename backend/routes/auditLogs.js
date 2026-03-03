import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticateToken, canViewAuditLog } from '../middleware/auth.js';

const router = express.Router();

// Helper to create an audit log entry (used by other routes)
export const createAuditLog = async ({ userId, username, userRole, action, resource, resourceId, details, req, status = 'success' }) => {
  try {
    const log = new AuditLog({
      userId,
      username,
      userRole,
      action,
      resource,
      resourceId: resourceId ? resourceId.toString() : null,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      status,
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('[v0] Failed to create audit log:', err.message);
    // Non-blocking: don't throw, just log
  }
};

// GET /api/audit-logs — Get audit logs (admin/bfar_admin only)
router.get('/', authenticateToken, canViewAuditLog, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, resource, userId, startDate, endDate } = req.query;
    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'username fullName role'),
      AuditLog.countDocuments(query),
    ]);

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
});

// GET /api/audit-logs/stats — Summary stats
router.get('/stats', authenticateToken, canViewAuditLog, async (req, res) => {
  try {
    const [byAction, byResource, recentActivity] = await Promise.all([
      AuditLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }]),
      AuditLog.aggregate([{ $group: { _id: '$resource', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'username'),
    ]);
    res.json({ byAction, byResource, recentActivity });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit log stats', error: error.message });
  }
});

export default router;
