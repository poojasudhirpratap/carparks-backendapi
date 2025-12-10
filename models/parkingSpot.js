const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  occupied: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
