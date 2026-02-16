import express from 'express';
import Ticket from '../models/Ticket.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all tickets with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority, category, search, submittedBy } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (submittedBy) query.submittedBy = submittedBy;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('submittedBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

// Get single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('submittedBy')
      .populate('assignedTo');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
});

// Create ticket
router.post('/', authenticateToken, async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      submittedBy: req.userId, // Assuming userId is set by auth middleware
    };
    const ticket = new Ticket(ticketData);
    await ticket.save();
    await ticket.populate('submittedBy');
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error creating ticket', error: error.message });
  }
});

// Update ticket
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate('submittedBy')
      .populate('assignedTo');
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error updating ticket', error: error.message });
  }
});

// Resolve ticket
router.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolution: req.body.resolution,
        resolvedAt: new Date(),
      },
      { new: true }
    )
      .populate('submittedBy')
      .populate('assignedTo');
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: 'Error resolving ticket', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
});

export default router;
