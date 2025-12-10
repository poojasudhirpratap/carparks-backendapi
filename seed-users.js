const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carparking';

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB for seeding users');

    const existing = await User.countDocuments();
    if (existing > 0) {
      console.log('ℹ Database already has users, skipping seed');
      mongoose.disconnect();
      return;
    }

    const users = [
      { name: 'Admin User', email: 'admin@carparking.com', password: 'admin123', role: 'admin' },
      { name: 'Attendant John', email: 'attendant@carparking.com', password: 'attendant123', role: 'attendant' },
      { name: 'User Alice', email: 'user1@example.com', password: 'user123', role: 'user' },
      { name: 'User Bob', email: 'user2@example.com', password: 'user123', role: 'user' }
    ];

    await User.insertMany(users);
    console.log('✓ Inserted 4 sample users');
    console.log('\nSample Credentials:');
    console.log('Admin:     admin@carparking.com / admin123');
    console.log('Attendant: attendant@carparking.com / attendant123');
    console.log('User 1:    user1@example.com / user123');
    console.log('User 2:    user2@example.com / user123');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('✗ Seeding error:', err.message);
    process.exit(1);
  }
}

seedUsers();
