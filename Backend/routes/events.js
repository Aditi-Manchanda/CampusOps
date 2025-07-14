const express = require('express');
const router = express.Router();
const { createEvent, getAllPublicEvents, getEventById, rsvpToEvent } = require('../controllers/eventController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllPublicEvents);
router.get('/:eventId', getEventById);

router.use(authMiddleware);
router.post('/', checkRole(['club_admin']), upload.single('poster'), createEvent);
router.post('/:eventId/rsvp', checkRole(['student']), rsvpToEvent);

module.exports = router;

