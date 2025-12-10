const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  vehicleNumber: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
