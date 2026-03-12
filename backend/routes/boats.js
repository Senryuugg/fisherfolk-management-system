import express from 'express';
import Boat from '../models/Boat.js';
import Approval from '../models/Approval.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';
import { createAuditLog } from './auditLogs.js';

const router = express.Router();

// Get all boats with filters
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { status, search, fisherfolkId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (fisherfolkId) query.fisherfolkId = fisherfolkId;
    if (search) {
      query.$or = [
        { boatName: { $regex: search, $options: 'i' } },
        { mfbrNumber: { $regex: search, $options: 'i' } },
        { frsNumber: { $regex: search, $options: 'i' } },
        { fisherfolkName: { $regex: search, $options: 'i' } },
      ];
    }

    const boats = await Boat.find(query)
      .populate('fisherfolkId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boats', error: error.message });
  }
});

// Get single boat
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).populate('fisherfolkId');
    if (!boat) return res.status(404).json({ message: 'Boat not found' });
    res.json(boat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boat', error: error.message });
  }
});

// Create boat — lgu_editor submissions go to approval queue
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    // Normalize field names from frontend (mfbrNo → mfbrNumber, frsNo → frsNumber)
    const payload = {
      ...req.body,
      mfbrNumber: req.body.mfbrNumber || req.body.mfbrNo,
      frsNumber:  req.body.frsNumber  || req.body.frsNo,
    };
    delete payload.mfbrNo;
    delete payload.frsNo;

    if (!payload.mfbrNumber) {
      return res.status(400).json({ message: 'MFBR Number is required' });
    }
    if (!payload.boatName) {
      return res.status(400).json({ message: 'Boat Name is required' });
    }

    // Duplicate check
    const existing = await Boat.findOne({ mfbrNumber: payload.mfbrNumber });
    if (existing) {
      return res.status(409).json({ message: `A boat with MFBR Number "${payload.mfbrNumber}" already exists.`, duplicate: true });
    }

    // lgu_editor → send to approval queue
    if (req.user.role === 'lgu_editor') {
      const approval = new Approval({
        submittedBy:         req.user.id,
        submittedByUsername: req.user.username,
        submittedByCity:     req.user.city,
        resource:            'boat',
        action:              'create',
        data:                payload,
      });
      await approval.save();

      await createAuditLog({
        userId:   req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        action:   'create',
        resource: 'boat',
        resourceId: approval._id,
        details:  { pendingApproval: true, mfbrNumber: payload.mfbrNumber, boatName: payload.boatName },
        req,
      });

      return res.status(202).json({
        message:         'Boat record submitted for approval',
        pendingApproval: true,
        approvalId:      approval._id,
      });
    }

    // Admin / supervisor → save directly
    const boat = new Boat(payload);
    await boat.save();

    await createAuditLog({
      userId:   req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action:   'create',
      resource: 'boat',
      resourceId: boat._id,
      details:  { mfbrNumber: boat.mfbrNumber, boatName: boat.boatName },
      req,
    });

    res.status(201).json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error creating boat', error: error.message });
  }
});

// Update boat
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      mfbrNumber: req.body.mfbrNumber || req.body.mfbrNo,
      frsNumber:  req.body.frsNumber  || req.body.frsNo,
    };
    delete payload.mfbrNo;
    delete payload.frsNo;

    const boat = await Boat.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('fisherfolkId');
    if (!boat) return res.status(404).json({ message: 'Boat not found' });

    await createAuditLog({
      userId: req.user.id, username: req.user.username, userRole: req.user.role,
      action: 'update', resource: 'boat', resourceId: boat._id,
      details: { changes: payload }, req,
    });

    res.json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating boat', error: error.message });
  }
});

// Delete boat
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    const boat = await Boat.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.id, username: req.user.username, userRole: req.user.role,
      action: 'delete', resource: 'boat', resourceId: req.params.id,
      details: { deletedRecord: boat }, req,
    });

    res.json({ message: 'Boat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting boat', error: error.message });
  }
});

export default router;
