import express from 'express';
import Boat from '../models/Boat.js';
import Fisherfolk from '../models/Fisherfolk.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all boats with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { fisherfolkId, status, search } = req.query;
    let query = {};

    if (fisherfolkId) query.fisherfolkId = fisherfolkId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { boatName: { $regex: search, $options: 'i' } },
        { mfbrNumber: { $regex: search, $options: 'i' } },
        { frsNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const boats = await Boat.find(query)
      .populate('fisherfolkId', 'firstName lastName rsbsaNumber')
      .limit(100);
    res.json(boats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boats', error: error.message });
  }
});

// Get single boat
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).populate(
      'fisherfolkId',
      'firstName lastName rsbsaNumber'
    );
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found' });
    }
    res.json(boat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boat', error: error.message });
  }
});

// Create boat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const boat = new Boat(req.body);
    await boat.save();

    // Add boat to fisherfolk's boats array
    if (req.body.fisherfolkId) {
      await Fisherfolk.findByIdAndUpdate(
        req.body.fisherfolkId,
        { $push: { boats: boat._id } },
        { new: true }
      );
    }

    res.status(201).json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error creating boat', error: error.message });
  }
});

// Update boat
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const boat = await Boat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('fisherfolkId', 'firstName lastName rsbsaNumber');
    res.json(boat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating boat', error: error.message });
  }
});

// Delete boat
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id);
    if (!boat) {
      return res.status(404).json({ message: 'Boat not found' });
    }

    // Remove boat from fisherfolk's boats array
    await Fisherfolk.findByIdAndUpdate(
      boat.fisherfolkId,
      { $pull: { boats: boat._id } },
      { new: true }
    );

    await Boat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting boat', error: error.message });
  }
});

export default router;
