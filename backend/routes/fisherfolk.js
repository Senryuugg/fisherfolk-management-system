import express from 'express';
import Fisherfolk from '../models/Fisherfolk.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all fisherfolk with filters
router.get('/', authenticateToken, async (req, res) => {
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

    const fisherfolk = await Fisherfolk.find(query)
      .populate('boats')
      .limit(50);
    res.json(fisherfolk);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fisherfolk', error: error.message });
  }
});

// Get single fisherfolk
router.get('/:id', authenticateToken, async (req, res) => {
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

// Create fisherfolk
router.post('/', authenticateToken, async (req, res) => {
  try {
    const fisherfolk = new Fisherfolk(req.body);
    await fisherfolk.save();
    res.status(201).json(fisherfolk);
  } catch (error) {
    res.status(400).json({ message: 'Error creating fisherfolk', error: error.message });
  }
});

// Update fisherfolk
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const fisherfolk = await Fisherfolk.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(fisherfolk);
  } catch (error) {
    res.status(400).json({ message: 'Error updating fisherfolk', error: error.message });
  }
});

// Delete fisherfolk
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Fisherfolk.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fisherfolk deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting fisherfolk', error: error.message });
  }
});

export default router;
