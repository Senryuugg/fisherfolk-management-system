import express from 'express';
import Gear from '../models/Gear.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all gears with optional filtering
router.get('/', auth, async (req, res) => {
  try {
    const { status, fisherfolk, province, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (fisherfolk) query.fisherfolk = { $regex: fisherfolk, $options: 'i' };
    if (province) query.province = province;

    if (search) {
      query.$or = [
        { mfbrNumber: { $regex: search, $options: 'i' } },
        { fisherfolk: { $regex: search, $options: 'i' } },
        { gearClassification: { $regex: search, $options: 'i' } },
      ];
    }

    const gears = await Gear.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: gears.length,
      data: gears,
    });
  } catch (error) {
    console.error('Error fetching gears:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gears',
      error: error.message,
    });
  }
});

// Get single gear by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const gear = await Gear.findById(req.params.id);

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found',
      });
    }

    res.json({
      success: true,
      data: gear,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gear',
      error: error.message,
    });
  }
});

// Create new gear
router.post('/', auth, async (req, res) => {
  try {
    const { mfbrNumber, frNumber, fisherfolk, gearClassification, registrationDate, province, cityMunicipality } =
      req.body;

    // Check if gear already exists
    const existingGear = await Gear.findOne({ mfbrNumber });
    if (existingGear) {
      return res.status(400).json({
        success: false,
        message: 'Gear with this MFBR number already exists',
      });
    }

    const gear = new Gear({
      mfbrNumber,
      frNumber,
      fisherfolk,
      gearClassification,
      registrationDate,
      province,
      cityMunicipality,
      status: 'active',
    });

    await gear.save();

    res.status(201).json({
      success: true,
      message: 'Gear created successfully',
      data: gear,
    });
  } catch (error) {
    console.error('Error creating gear:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating gear',
      error: error.message,
    });
  }
});

// Update gear
router.put('/:id', auth, async (req, res) => {
  try {
    const gear = await Gear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found',
      });
    }

    res.json({
      success: true,
      message: 'Gear updated successfully',
      data: gear,
    });
  } catch (error) {
    console.error('Error updating gear:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gear',
      error: error.message,
    });
  }
});

// Delete gear
router.delete('/:id', auth, async (req, res) => {
  try {
    const gear = await Gear.findByIdAndDelete(req.params.id);

    if (!gear) {
      return res.status(404).json({
        success: false,
        message: 'Gear not found',
      });
    }

    res.json({
      success: true,
      message: 'Gear deleted successfully',
      data: gear,
    });
  } catch (error) {
    console.error('Error deleting gear:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gear',
      error: error.message,
    });
  }
});

// Get statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const total = await Gear.countDocuments();
    const active = await Gear.countDocuments({ status: 'active' });
    const byClassification = await Gear.aggregate([
      { $group: { _id: '$gearClassification', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        byClassification,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
});

export default router;
