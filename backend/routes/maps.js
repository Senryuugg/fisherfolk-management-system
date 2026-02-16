import express from 'express';
import MapData from '../models/MapData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all map layers with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { layerType, visible, status } = req.query;
    let query = {};

    if (layerType) query.layerType = layerType;
    if (visible !== undefined) query.visible = visible === 'true';
    if (status) query.status = status;

    const layers = await MapData.find(query).sort({ layerName: 1 });
    res.json(layers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching map layers', error: error.message });
  }
});

// Get single map layer
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const layer = await MapData.findById(req.params.id);
    if (!layer) {
      return res.status(404).json({ message: 'Map layer not found' });
    }
    res.json(layer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching map layer', error: error.message });
  }
});

// Create map layer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const layer = new MapData(req.body);
    await layer.save();
    res.status(201).json(layer);
  } catch (error) {
    res.status(400).json({ message: 'Error creating map layer', error: error.message });
  }
});

// Update map layer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const layer = await MapData.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(layer);
  } catch (error) {
    res.status(400).json({ message: 'Error updating map layer', error: error.message });
  }
});

// Get buffer zone (protected area)
router.post('/buffer/calculate', authenticateToken, async (req, res) => {
  try {
    const { centerCoordinates, radiusKm } = req.body;

    // Calculate buffer zone using geospatial query
    // Find all features within the radius
    const bufferZone = await MapData.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: centerCoordinates, // [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
    });

    res.json({
      centerCoordinates,
      radiusKm,
      protectedArea: bufferZone,
      count: bufferZone.length,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error calculating buffer zone', error: error.message });
  }
});

// Toggle layer visibility
router.post('/:id/toggle-visibility', authenticateToken, async (req, res) => {
  try {
    const layer = await MapData.findById(req.params.id);
    if (!layer) {
      return res.status(404).json({ message: 'Map layer not found' });
    }
    layer.visible = !layer.visible;
    await layer.save();
    res.json(layer);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling visibility', error: error.message });
  }
});

// Delete map layer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await MapData.findByIdAndDelete(req.params.id);
    res.json({ message: 'Map layer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting map layer', error: error.message });
  }
});

export default router;
