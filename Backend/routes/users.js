const express = require('express');
const router = express.Router();
const { getMe, requestRole, getMyRsvps } = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/me', getMe);
router.post('/request-role', requestRole);
router.get('/my-rsvps', checkRole(['student']), getMyRsvps);

module.exports = router;

