const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { verifyToken, checkRole } = require('../middleware/auth');

// List all users (admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (admin or self)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Allow admin or user viewing their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin or self)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Allow admin or user updating their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only admin can change role or active status
    if (req.user.role !== 'admin') {
      if (role || isActive !== undefined) {
        return res.status(403).json({ error: 'Only admin can modify role or active status' });
      }
    }

    if (name) user.name = name;
    if (role && req.user.role === 'admin') user.role = role;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;

    user.updatedAt = new Date();
    await user.save();

    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
