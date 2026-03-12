import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeRole, canManageUsers } from '../middleware/auth.js';
import { createAuditLog } from './auditLogs.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fullName').notEmpty().withMessage('Full name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password, fullName, department, region, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Default role
      let assignedRole = 'lgu_editor';
      const validRoles = ['admin', 'bfar_supervisor', 'bfar_viewer', 'lgu_supervisor', 'lgu_editor'];
      if (role && validRoles.includes(role)) {
        assignedRole = role;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        fullName,
        department,
        region,
        role: assignedRole,
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isValid = await user.comparePassword(password);
      if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

      if (!user.active) return res.status(403).json({ message: 'Account is inactive. Contact administrator.' });

      // Login — include city in token so backend approval routing works
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role, city: user.city },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      await createAuditLog({
        userId: user._id,
        username: user.username,
        userRole: user.role,
        action: 'login',
        resource: 'user',
        resourceId: user._id,
        details: { username: user.username },
        req,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          city: user.city,
          region: user.region,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Create user (Admin, bfar_admin, lgu_admin can create users)
router.post('/users', authenticateToken, canManageUsers, async (req, res) => {
  try {
    const { username, email, password, fullName, department, region, city, role } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Role permission rules (who can create which roles)
    const allowedRolesByCreator = {
      admin:           ['admin', 'bfar_supervisor', 'bfar_viewer', 'lgu_supervisor', 'lgu_editor'],
      bfar_supervisor: ['bfar_supervisor', 'bfar_viewer', 'lgu_supervisor', 'lgu_editor'],
      lgu_supervisor:  ['lgu_editor'],
    };
    const allowed = allowedRolesByCreator[req.user.role] || [];
    if (role && !allowed.includes(role)) {
      return res.status(403).json({ message: `You cannot create a user with role "${role}"` });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists', duplicate: true });
    }

    const newUser = new User({
      username,
      email,
      password,
      fullName,
      department,
      region,
      city,
      role: role || 'lgu_editor',
    });

    await newUser.save();

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'create',
      resource: 'user',
      resourceId: newUser._id,
      details: { createdUsername: username, role: newUser.role },
      req,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        department: newUser.department,
        city: newUser.city,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (based on role)
router.get('/users', authenticateToken, canManageUsers, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'lgu_supervisor') {
      query = { role: { $in: ['lgu_supervisor', 'lgu_editor'] }, city: req.user.city };
    } else if (req.user.role === 'bfar_supervisor') {
      query = { role: { $ne: 'admin' } };
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { username, email, fullName, department, region, city, role, active, password } = req.body;

    const isAdmin       = ['admin', 'bfar_supervisor'].includes(req.user.role);
    const isManagerRole = req.user.role === 'lgu_supervisor';
    const isUpdatingSelf = req.user.id === req.params.id;

    if (!isAdmin && !isManagerRole && !isUpdatingSelf) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }

    // Non-admins cannot change role or active status (except managers for their managed users)
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (!isAdmin && !isManagerRole && (role || active !== undefined)) {
      return res.status(403).json({ message: 'You cannot change role or active status' });
    }

    // Check for duplicate username/email
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists', duplicate: true });
    }

    const updateData = { username, email, fullName, department, region, city };
    if (isAdmin || isManagerRole) {
      if (role) updateData.role = role;
      if (active !== undefined) updateData.active = active;
    }
    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.default.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'update',
      resource: 'user',
      resourceId: req.params.id,
      details: { updatedFields: Object.keys(updateData) },
      req,
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin and bfar_admin only)
router.delete('/users/:id', authenticateToken, canManageUsers, async (req, res) => {
  try {
    if (!['admin', 'bfar_supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await createAuditLog({
      userId: req.user.id,
      username: req.user.username,
      userRole: req.user.role,
      action: 'delete',
      resource: 'user',
      resourceId: req.params.id,
      details: { deletedUsername: user.username },
      req,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
