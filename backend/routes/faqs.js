import express from 'express';
import FAQ from '../models/FAQ.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQs with filters (public endpoint - no auth required)
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = { status: 'active' };

    if (category) query.category = category;
    if (status) query.status = status;

    const faqs = await FAQ.find(query).sort({ order: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
});

// Get single FAQ
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    // Increment views
    faq.views += 1;
    await faq.save();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching FAQ', error: error.message });
  }
});

// Create FAQ (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ message: 'Error creating FAQ', error: error.message });
  }
});

// Update FAQ (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(faq);
  } catch (error) {
    res.status(400).json({ message: 'Error updating FAQ', error: error.message });
  }
});

// Mark FAQ as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
});

// Mark FAQ as not helpful
router.post('/:id/not-helpful', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { notHelpful: 1 } },
      { new: true }
    );
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
  }
});

export default router;
