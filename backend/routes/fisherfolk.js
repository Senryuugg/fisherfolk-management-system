import express from 'express';
import Fisherfolk, { getRenewalYears } from '../models/Fisherfolk.js';
import Approval from '../models/Approval.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';
import { createAuditLog } from './auditLogs.js';

const router = express.Router();

// Get all fisherfolk with filters
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { province, city, barangay, status, search } = req.query;
    let query = {};

    if (province) query.province = province;
    if (city) query.cityMunicipality = city;
    if (barangay) query.barangay = barangay;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { rsbsaNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const fisherfolk = await Fisherfolk.find(query).populate('boats');
    res.json(fisherfolk);
  } catch (error) {
    console.error('[v0] Error fetching fisherfolk:', error);
    res.status(500).json({ message: 'Error fetching fisherfolk', error: error.message });
  }
});

// Get single fisherfolk
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const fisherfolk = await Fisherfolk.findById(req.params.id).populate('boats');
    if (!fisherfolk) {
      return res.status(404).json({ message: 'Fisherfolk not found' });
    }
    res.json(fisherfolk);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fisherfolk', error: error.message });
  }
});

// Create fisherfolk — lgu_user submissions go to approval queue
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const { rsbsaNumber, firstName, lastName, cityMunicipality } = req.body;

    // Required field validation
    if (!rsbsaNumber || !firstName || !lastName) {
      return res.status(400).json({ message: 'RSBSA Number, First Name, and Last Name are required' });
    }

    // Duplicate detection: check by RSBSA number
    const existingByRsbsa = await Fisherfolk.findOne({ rsbsaNumber });
    if (existingByRsbsa) {
      return res.status(409).json({
        message: `Duplicate record: A fisherfolk with RSBSA Number "${rsbsaNumber}" already exists.`,
        duplicate: true,
        existingId: existingByRsbsa._id,
      });
    }

    // Duplicate detection: same full name + city
    const existingByName = await Fisherfolk.findOne({
      firstName: { $regex: `^${firstName}$`, $options: 'i' },
      lastName: { $regex: `^${lastName}$`, $options: 'i' },
      cityMunicipality: cityMunicipality || { $exists: true },
    });
    if (existingByName) {
      return res.status(409).json({
        message: `Possible duplicate: A fisherfolk named "${firstName} ${lastName}" in the same city already exists. Please verify.`,
        duplicate: true,
        possibleDuplicate: true,
        existingId: existingByName._id,
      });
    }

    // LGU editor submissions go to approval queue
    if (req.user.role === 'lgu_editor') {
      const approval = new Approval({
        submittedBy: req.user.id,
        submittedByUsername: req.user.username,
        submittedByCity: req.user.city,
        resource: 'fisherfolk',
        action: 'create',
        data: req.body,
      });
      await approval.save();

      await createAuditLog({
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        action: 'create',
        resource: 'fisherfolk',
        resourceId: approval._id,
        details: { pendingApproval: true, rsbsaNumber, firstName, lastName },
        req,
      });

      return res.status(202).json({
        message: 'Fisherfolk record submitted for approval',
        pendingApproval: true,
        approvalId: approval._id,
      });
    }

    // Admin/BFAR users save directly
    const fisherfolk = new Fisherfolk(req.body);
    await fisherfolk.save();

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'create',
      resource: 'fisherfolk',
      resourceId: fisherfolk._id,
      details: { rsbsaNumber, firstName, lastName },
      req,
    });

    res.status(201).json(fisherfolk);
  } catch (error) {
    res.status(400).json({ message: 'Error creating fisherfolk', error: error.message });
  }
});

// Update fisherfolk
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const prev = await Fisherfolk.findById(req.params.id);
    const fisherfolk = await Fisherfolk.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'update',
      resource: 'fisherfolk',
      resourceId: fisherfolk._id,
      details: { changes: req.body, previous: prev },
      req,
    });

    res.json(fisherfolk);
  } catch (error) {
    res.status(400).json({ message: 'Error updating fisherfolk', error: error.message });
  }
});

// Delete fisherfolk
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    const fisherfolk = await Fisherfolk.findByIdAndDelete(req.params.id);

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'delete',
      resource: 'fisherfolk',
      resourceId: req.params.id,
      details: { deletedRecord: fisherfolk },
      req,
    });

    res.json({ message: 'Fisherfolk deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting fisherfolk', error: error.message });
  }
});

// Renew registration — sets renewalDate to today and recomputes registrationExpiry
router.post('/:id/renew', authenticateToken, canUpdate, async (req, res) => {
  try {
    const fish = await Fisherfolk.findById(req.params.id);
    if (!fish) return res.status(404).json({ message: 'Fisherfolk not found' });

    fish.renewalDate = new Date();
    fish.status = 'active'; // re-activate if they were inactive due to expiry

    // registrationExpiry is recomputed automatically in the pre-save hook
    await fish.save();

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'update',
      resource: 'fisherfolk',
      resourceId: fish._id,
      details: {
        action: 'renewal',
        renewalDate: fish.renewalDate,
        newExpiry: fish.registrationExpiry,
        renewalYears: getRenewalYears(fish.cityMunicipality),
      },
      req,
    });

    res.json({ message: 'Registration renewed successfully', fisherfolk: fish });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
