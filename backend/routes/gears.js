import express from 'express';
import Gear from '../models/Gear.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';

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
        { gearType: { $regex: search, $options: 'i' } },
        { gearClassification: { $regex: search, $options: 'i' } },
        { frsNumber: { $regex: search, $options: 'i' } },
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
    if (!gear) {
      return res.status(404).json({ message: 'Gear not found' });
    }
    res.json(gear);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gear', error: error.message });
  }
});

// Create gear
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const gear = new Gear(req.body);
    await gear.save();
    await gear.populate('fisherfolkId');
    res.status(201).json(gear);
  } catch (error) {
    res.status(400).json({ message: 'Error creating gear', error: error.message });
  }
});

// Update gear
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const gear = await Gear.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('fisherfolkId');
    res.json(gear);
  } catch (error) {
    res.status(400).json({ message: 'Error updating gear', error: error.message });
  }
});

// Delete gear
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    await Gear.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gear deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting gear', error: error.message });
  }
});

export default router;
