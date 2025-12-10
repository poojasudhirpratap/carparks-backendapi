const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ParkingSpot = require('./models/parkingSpot');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carparking';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB for seeding');

    const existing = await ParkingSpot.countDocuments();
    if (existing > 0) {
      console.log('ℹ Database already has parking spots, skipping seed');
      mongoose.disconnect();
      return;
    }

    const spots = [
      { number: 'P-001', location: 'Level 1 - Row A' },
      { number: 'P-002', location: 'Level 1 - Row A' },
      { number: 'P-003', location: 'Level 1 - Row B' },
      { number: 'P-004', location: 'Level 1 - Row B' },
      { number: 'P-005', location: 'Level 2 - Row C' },
      { number: 'P-006', location: 'Level 2 - Row C' },
      { number: 'P-007', location: 'Level 2 - Row D' },
      { number: 'P-008', location: 'Level 2 - Row D' },
      { number: 'P-009', location: 'Level 3 - Row E' },
      { number: 'P-010', location: 'Level 3 - Row E' }
    ];

    await ParkingSpot.insertMany(spots);
    console.log('✓ Inserted 10 sample parking spots');
    mongoose.disconnect();
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
