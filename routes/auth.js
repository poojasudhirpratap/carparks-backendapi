const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminToken } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (min 6 chars)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Determine role based on registration type
    let userRole = 'user'; // Default role for self-registration

    // If admin token provided, allow role assignment (admin-only registration)
    if (adminToken) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET);
        const admin = await User.findById(decoded.id);
        
        if (!admin || admin.role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can assign roles' });
        }

        // Admin can assign roles
        if (role && ['admin', 'attendant', 'user'].includes(role)) {
          userRole = role;
        }
      } catch (err) {
        return res.status(401).json({ error: 'Invalid admin token' });
      }
    } else if (role && role !== 'user') {
      // Non-admins cannot self-register as admin/attendant
      return res.status(403).json({ error: 'Only admins can register users with special roles' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: userRole
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(201).json({
      ok: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({
      ok: true,
      token,
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').verifyToken, (req, res) => {
  res.json(req.user.toJSON());
});

// Admin: Register a new user with specific role
router.post('/admin/register', require('../middleware/auth').verifyToken, require('../middleware/auth').checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // Validate role
    if (!['admin', 'attendant', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, attendant, or user' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user with admin-assigned role
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      ok: true,
      message: `User registered as ${role}`,
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
