const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./firebaseConfig');
const reminderJobs = require('./jobs/reminderJobs');

// Import routes
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const roomRoutes = require('./routes/rooms');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/health', (req, res) => res.status(200).send({ status: 'OK', message: 'Server is healthy' }));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Start cron jobs
  reminderJobs.start();
});
