import express from 'express';
import DevelopmentLevel from '../models/DevelopmentLevel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all development levels
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    const levels = await DevelopmentLevel.find(query).sort({ level: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching development levels', error: error.message });
  }
});

// Get single development level
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const level = await DevelopmentLevel.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ message: 'Development level not found' });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching development level', error: error.message });
  }
});

// Create development level
router.post('/', authenticateToken, async (req, res) => {
  try {
    const level = new DevelopmentLevel(req.body);
    await level.save();
    res.status(201).json(level);
  } catch (error) {
    res.status(400).json({ message: 'Error creating development level', error: error.message });
  }
});

// Update development level
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const level = await DevelopmentLevel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(level);
  } catch (error) {
    res.status(400).json({ message: 'Error updating development level', error: error.message });
  }
});

// Delete development level
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await DevelopmentLevel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Development level deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting development level', error: error.message });
  }
});

export default router;
