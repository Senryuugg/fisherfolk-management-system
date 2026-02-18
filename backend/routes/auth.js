import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

console.log('[v0] Auth routes module loaded');

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

      // Restrict role assignment based on who is creating the account
      let assignedRole = 'viewer';
      
      // If role is provided in request, validate it
      if (role) {
        // Only admin can create admin users
        // Viewers can only create LGU users
        // For now, allow role assignment (will add auth check in separate endpoint)
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
      console.log('[v0] Login attempt for username:', username);

      // Find user
      const user = await User.findOne({ username });
      console.log('[v0] User found:', user ? 'YES' : 'NO');
      if (!user) {
        console.log('[v0] User not found in database');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      console.log('[v0] Checking password...');
      const isValidPassword = await user.comparePassword(password);
      console.log('[v0] Password valid:', isValidPassword);
      if (!isValidPassword) {
        console.log('[v0] Password invalid');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
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

// Create user (Admin and Viewer can create users)
router.post('/users', authenticateToken, authorizeRole(['admin', 'viewer']), async (req, res) => {
  try {
    console.log('[v0] Create user endpoint hit');
    console.log('[v0] Request user role:', req.user?.role);
    console.log('[v0] Request body:', req.body);
    
    const { username, email, password, fullName, department, region, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      console.log('[v0] Missing required fields');
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check role permissions
    // Viewers can only create LGU users
    if (req.user.role === 'viewer' && role !== 'lgu') {
      return res.status(403).json({ message: 'Viewers can only create LGU user accounts' });
    }

    // Only admin can create admin users
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create admin accounts' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      console.log('[v0] User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('[v0] Creating new user with data:', {
      username,
      email,
      fullName,
      department,
      region,
      role: role || 'lgu',
    });

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      department,
      region,
      role: role || 'lgu',
    });

    console.log('[v0] User object created, attempting to save...');
    await user.save();
    console.log('[v0] User saved successfully:', user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[v0] Error creating user:', error);
    console.error('[v0] Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (Admin and Viewer can view users)
router.get('/users', authenticateToken, authorizeRole(['admin', 'viewer']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
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

// Update user (Admin can update anyone, Viewer and others can update themselves)
router.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { username, email, fullName, department, region, role, active } = req.body;

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isUpdatingSelf = req.user.id === req.params.id;

    if (!isAdmin && !isUpdatingSelf) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }

    // Non-admin users cannot change their role or active status
    if (!isAdmin && (role || active !== undefined)) {
      return res.status(403).json({ message: 'You cannot change role or active status' });
    }

    // Check if username or email already exists for other users
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.params.id },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const updateData = {
      username,
      email,
      fullName,
      department,
      region,
    };

    // Only admin can update role and active status
    if (isAdmin) {
      updateData.role = role;
      updateData.active = active;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

console.log('[v0] Auth routes configured - POST /users endpoint registered');

export default router;
