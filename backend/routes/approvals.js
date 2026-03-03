import express from 'express';
import Approval from '../models/Approval.js';
import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import Organization from '../models/Organization.js';
import { authenticateToken, canApprove } from '../middleware/auth.js';
import { createAuditLog } from './auditLogs.js';

const router = express.Router();

// GET /api/approvals — List pending/all approvals
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20, resource } = req.query;
    const query = {};

    if (status) query.status = status;
    if (resource) query.resource = resource;

    // LGU admin can only see submissions from their city
    if (req.user.role === 'lgu_admin') {
      query.submittedByCity = req.user.city;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [approvals, total] = await Promise.all([
      Approval.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('submittedBy', 'username fullName role city')
        .populate('reviewedBy', 'username fullName'),
      Approval.countDocuments(query),
    ]);

    res.json({ approvals, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approvals', error: error.message });
  }
});

// GET /api/approvals/count — Count pending approvals (for badge)
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const query = { status: 'pending' };
    if (req.user.role === 'lgu_admin') {
      query.submittedByCity = req.user.city;
    }
    const count = await Approval.countDocuments(query);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting approvals', error: error.message });
  }
});

// POST /api/approvals/:id/approve — Approve a submission
router.post('/:id/approve', authenticateToken, canApprove, async (req, res) => {
  try {
    const { reviewNotes = '' } = req.body;
    const approval = await Approval.findById(req.params.id);

    if (!approval) return res.status(404).json({ message: 'Approval request not found' });
    if (approval.status !== 'pending') return res.status(400).json({ message: 'This request has already been reviewed' });

    // Apply the data change to the actual resource
    let result = null;
    try {
      if (approval.action === 'create') {
        const ModelMap = { fisherfolk: Fisherfolk, boat: Boat, gear: Gear, organization: Organization };
        const Model = ModelMap[approval.resource];
        if (Model) {
          const doc = new Model(approval.data);
          result = await doc.save();
          approval.resourceId = result._id;
        }
      } else if (approval.action === 'update' && approval.resourceId) {
        const ModelMap = { fisherfolk: Fisherfolk, boat: Boat, gear: Gear, organization: Organization };
        const Model = ModelMap[approval.resource];
        if (Model) {
          result = await Model.findByIdAndUpdate(approval.resourceId, approval.data, { new: true });
        }
      } else if (approval.action === 'delete' && approval.resourceId) {
        const ModelMap = { fisherfolk: Fisherfolk, boat: Boat, gear: Gear, organization: Organization };
        const Model = ModelMap[approval.resource];
        if (Model) {
          await Model.findByIdAndDelete(approval.resourceId);
        }
      }
    } catch (err) {
      return res.status(500).json({ message: 'Failed to apply the data change', error: err.message });
    }

    // Update approval record
    approval.status = 'approved';
    approval.reviewedBy = req.user.id;
    approval.reviewedByUsername = req.user.username;
    approval.reviewNotes = reviewNotes;
    approval.reviewedAt = new Date();
    await approval.save();

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'approve',
      resource: approval.resource,
      resourceId: approval.resourceId,
      details: { approvalId: approval._id, submittedBy: approval.submittedByUsername, reviewNotes },
      req,
    });

    res.json({ message: 'Submission approved successfully', approval, result });
  } catch (error) {
    res.status(500).json({ message: 'Error approving submission', error: error.message });
  }
});

// POST /api/approvals/:id/reject — Reject a submission
router.post('/:id/reject', authenticateToken, canApprove, async (req, res) => {
  try {
    const { reviewNotes = '' } = req.body;
    const approval = await Approval.findById(req.params.id);

    if (!approval) return res.status(404).json({ message: 'Approval request not found' });
    if (approval.status !== 'pending') return res.status(400).json({ message: 'This request has already been reviewed' });

    approval.status = 'rejected';
    approval.reviewedBy = req.user.id;
    approval.reviewedByUsername = req.user.username;
    approval.reviewNotes = reviewNotes;
    approval.reviewedAt = new Date();
    await approval.save();

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'reject',
      resource: approval.resource,
      resourceId: approval.resourceId,
      details: { approvalId: approval._id, submittedBy: approval.submittedByUsername, reviewNotes },
      req,
    });

    res.json({ message: 'Submission rejected', approval });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting submission', error: error.message });
  }
});

export default router;
