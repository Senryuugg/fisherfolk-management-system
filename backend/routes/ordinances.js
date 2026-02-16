import express from 'express';
import OrdinanceResolution from '../models/OrdinanceResolution.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all ordinances/resolutions with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, organizationId, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (organizationId) query.organizationId = organizationId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ordinanceNumber: { $regex: search, $options: 'i' } },
        { resolutionNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await OrdinanceResolution.find(query)
      .populate('organizationId', 'name')
      .sort({ dateAdopted: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Get single ordinance/resolution
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await OrdinanceResolution.findById(req.params.id).populate('organizationId');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// Create ordinance/resolution
router.post('/', authenticateToken, async (req, res) => {
  try {
    const document = new OrdinanceResolution(req.body);
    await document.save();
    await document.populate('organizationId');
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: 'Error creating document', error: error.message });
  }
});

// Update ordinance/resolution
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await OrdinanceResolution.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('organizationId');
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: 'Error updating document', error: error.message });
  }
});

// Delete ordinance/resolution
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await OrdinanceResolution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

export default router;
