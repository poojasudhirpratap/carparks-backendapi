const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/parkingSpot');
const { verifyToken, checkRole } = require('../middleware/auth');

// List all parking spots (authenticated users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const spots = await ParkingSpot.find().sort('number');
    res.json(spots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new parking spot (admin/attendant only)
router.post('/', verifyToken, checkRole(['admin', 'attendant']), async (req, res) => {
  try {
    const { number, location } = req.body;
    if (!number) return res.status(400).json({ error: 'Spot number is required' });

    const spot = new ParkingSpot({ number, location });
    await spot.save();
    res.status(201).json(spot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
