import express from 'express';
import Gear from '../models/Gear.js';
import Approval from '../models/Approval.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';
import { createAuditLog } from './auditLogs.js';

const router = express.Router();

// Get all gears with filters
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { status, search, fisherfolkId, condition } = req.query;
    let query = {};

    if (status) query.status = status;
    if (fisherfolkId) query.fisherfolkId = fisherfolkId;
    if (condition) query.condition = condition;
    if (search) {
      query.$or = [
        { gearType:           { $regex: search, $options: 'i' } },
        { gearClassification: { $regex: search, $options: 'i' } },
        { frsNumber:          { $regex: search, $options: 'i' } },
        { fisherfolkName:     { $regex: search, $options: 'i' } },
      ];
    }

    const gears = await Gear.find(query)
      .populate('fisherfolkId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(gears);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gears', error: error.message });
  }
});

// Get single gear
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const gear = await Gear.findById(req.params.id).populate('fisherfolkId');
    if (!gear) return res.status(404).json({ message: 'Gear not found' });
    res.json(gear);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gear', error: error.message });
  }
});

// Create gear — lgu_editor submissions go to approval queue
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      frsNumber: req.body.frsNumber || req.body.frsNo,
    };
    delete payload.frsNo;

    if (!payload.gearType) {
      return res.status(400).json({ message: 'Gear Type is required' });
    }

    // lgu_editor → send to approval queue
    if (req.user.role === 'lgu_editor') {
      const approval = new Approval({
        submittedBy:         req.user.id,
        submittedByUsername: req.user.username,
        submittedByCity:     req.user.city,
        resource:            'gear',
        action:              'create',
        data:                payload,
      });
      await approval.save();

      await createAuditLog({
        userId:   req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        action:   'create',
        resource: 'gear',
        resourceId: approval._id,
        details:  { pendingApproval: true, gearType: payload.gearType },
        req,
      });

      return res.status(202).json({
        message:         'Gear record submitted for approval',
        pendingApproval: true,
        approvalId:      approval._id,
      });
    }

    // Admin / supervisor → save directly
    const gear = new Gear(payload);
    await gear.save();

    await createAuditLog({
      userId:   req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action:   'create',
      resource: 'gear',
      resourceId: gear._id,
      details:  { gearType: gear.gearType },
      req,
    });

    res.status(201).json(gear);
  } catch (error) {
    res.status(400).json({ message: 'Error creating gear', error: error.message });
  }
});

// Update gear
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const payload = { ...req.body, frsNumber: req.body.frsNumber || req.body.frsNo };
    delete payload.frsNo;

    const gear = await Gear.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('fisherfolkId');
    if (!gear) return res.status(404).json({ message: 'Gear not found' });

    await createAuditLog({
      userId: req.user.id, username: req.user.username, userRole: req.user.role,
      action: 'update', resource: 'gear', resourceId: gear._id,
      details: { changes: payload }, req,
    });

    res.json(gear);
  } catch (error) {
    res.status(400).json({ message: 'Error updating gear', error: error.message });
  }
});

// Delete gear
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    const gear = await Gear.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.id, username: req.user.username, userRole: req.user.role,
      action: 'delete', resource: 'gear', resourceId: req.params.id,
      details: { deletedRecord: gear }, req,
    });

    res.json({ message: 'Gear deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gear', error: error.message });
  }
});

export default router;
