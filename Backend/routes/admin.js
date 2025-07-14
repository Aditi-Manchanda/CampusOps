const express = require('express');
const router = express.Router();
const { getRoleRequests, decideRole, getPendingEvents, decideEvent, checkInUser } = require('../controllers/adminController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/role-requests', checkRole(['staff']), getRoleRequests);
router.post('/decide-role', checkRole(['staff']), decideRole);
router.get('/pending-events', checkRole(['staff']), getPendingEvents);
router.post('/decide-event', checkRole(['staff']), decideEvent);
router.post('/check-in', checkRole(['staff', 'club_admin']), checkInUser);

module.exports = router;
