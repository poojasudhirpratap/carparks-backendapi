const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const ParkingSpot = require('../models/parkingSpot');
const { verifyToken, checkRole } = require('../middleware/auth');

// List all bookings (authenticated users)
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('spot').sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new booking (authenticated users)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { spotId, vehicleNumber, endTime } = req.body;
    
    if (!spotId || !vehicleNumber) {
      return res.status(400).json({ error: 'spotId and vehicleNumber are required' });
    }

    const spot = await ParkingSpot.findById(spotId);
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });
    if (spot.occupied) return res.status(400).json({ error: 'Spot is already occupied' });

    const booking = new Booking({
      spot: spot._id,
      vehicleNumber,
      endTime
    });
    await booking.save();

    spot.occupied = true;
    await spot.save();

    const populatedBooking = await booking.populate('spot');
    res.status(201).json(populatedBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel a booking (authenticated users - own booking or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const spot = await ParkingSpot.findById(booking.spot);
    if (spot) {
      spot.occupied = false;
      await spot.save();
    }

    await booking.deleteOne();
    res.json({ ok: true, message: 'Booking cancelled and spot freed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
