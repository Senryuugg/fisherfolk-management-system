import express from 'express';
import Boat from '../models/Boat.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';

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
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found' });
    }
    res.json(boat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boat', error: error.message });
  }
});

// Create boat
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const boat = new Boat(req.body);
    await boat.save();
    await boat.populate('fisherfolkId');
    res.status(201).json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error creating boat', error: error.message });
  }
});

// Update boat
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const boat = await Boat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('fisherfolkId');
    res.json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating boat', error: error.message });
  }
});

// Delete boat
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    await Boat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting boat', error: error.message });
  }
});

export default router;
