const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carparking';

// Import routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const parkingRouter = require('./routes/parking');
const bookingsRouter = require('./routes/bookings');

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/parking', parkingRouter);
app.use('/api/bookings', bookingsRouter);

// Health check
app.get('/', (req, res) => res.json({ ok: true, message: 'Car Parking Management API' }));
app.get('/sudhir', (req, res) => res.json({ ok: true, message: 'This is Sudhir Kumar Singh.' }));

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
