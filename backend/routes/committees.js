import express from 'express';
import Committee from '../models/Committee.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';

const router = express.Router();

// Get all committees with filters
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { organizationId, status, search } = req.query;
    let query = {};

    if (organizationId) query.organizationId = organizationId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { committeeName: { $regex: search, $options: 'i' } },
        { chairman: { $regex: search, $options: 'i' } },
      ];
    }

    const committees = await Committee.find(query)
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 });
    res.json(committees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching committees', error: error.message });
  }
});

// Get single committee
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const committee = await Committee.findById(req.params.id).populate('organizationId');
    if (!committee) {
      return res.status(404).json({ message: 'Committee not found' });
    }
    res.json(committee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching committee', error: error.message });
  }
});

// Create committee
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const committee = new Committee(req.body);
    await committee.save();
    await committee.populate('organizationId');
    res.status(201).json(committee);
  } catch (error) {
    res.status(400).json({ message: 'Error creating committee', error: error.message });
  }
});

// Update committee
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const committee = await Committee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('organizationId');
    res.json(committee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating committee', error: error.message });
  }
});

// Delete committee
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    await Committee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Committee deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting committee', error: error.message });
  }
});

export default router;
