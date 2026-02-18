import express from 'express';
import Officer from '../models/Officer.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';

const router = express.Router();

// Get all officers with filters
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { organizationId, status, search } = req.query;
    let query = {};

    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    const officers = await Officer.find(query)
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 });
    res.json(officers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching officers', error: error.message });
  }
});

// Get single officer
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).populate('organizationId');
    if (!officer) {
      return res.status(404).json({ message: 'Officer not found' });
    }
    res.json(officer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching officer', error: error.message });
  }
});

// Create officer
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const officer = new Officer(req.body);
    await officer.save();
    await officer.populate('organizationId');
    res.status(201).json(officer);
  } catch (error) {
    res.status(400).json({ message: 'Error creating officer', error: error.message });
  }
});

// Update officer
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const officer = await Officer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('organizationId');
    res.json(officer);
  } catch (error) {
    res.status(400).json({ message: 'Error updating officer', error: error.message });
  }
});

// Delete officer
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    await Officer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Officer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting officer', error: error.message });
  }
});

export default router;
