const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomBookings } = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getAllRooms);
router.get('/bookings', getRoomBookings);

module.exports = router;

