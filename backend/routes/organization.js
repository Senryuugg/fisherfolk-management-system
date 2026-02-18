import express from 'express';
import Organization from '../models/Organization.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';

const router = express.Router();

// Get all organizations
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { region, status } = req.query;
    let query = {};

    if (region) query.region = region;
    if (status) query.status = status;

    const organizations = await Organization.find(query)
      .populate('members')
      .limit(100);
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
});

// Get single organization
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).populate('members');
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(org);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organization', error: error.message });
  }
});

// Create organization
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const org = new Organization(req.body);
    await org.save();
    res.status(201).json(org);
  } catch (error) {
    res.status(400).json({ message: 'Error creating organization', error: error.message });
  }
});

// Update organization
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('members');
    res.json(org);
  } catch (error) {
    res.status(400).json({ message: 'Error updating organization', error: error.message });
  }
});

// Delete organization
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organization deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
});

export default router;
