const { db } = require('../firebaseConfig');

const getMe = async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).send({ message: 'User not found.' });
    res.status(200).send({ ...doc.data(), isNewUser: req.user.isNewUser });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

const requestRole = async (req, res) => {
    const { requestedRole, associatedClub } = req.body;
    if (!requestedRole || (requestedRole === 'club_admin' && !associatedClub)) {
        return res.status(400).send({ message: 'Role and club name are required.' });
    }
    if (req.user.role !== 'pending_approval') {
        return res.status(403).send({ message: 'You have already been assigned a role.' });
    }
    try {
        const updateData = { requestedRole, role: 'pending_approval' };
        if (associatedClub) updateData.associatedClub = associatedClub;
        await db.collection('users').doc(req.user.uid).update(updateData);
        res.status(200).send({ message: 'Role request submitted successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

const getMyRsvps = async (req, res) => {
    try {
        const rsvpsSnapshot = await db.collection('rsvps').where('userId', '==', req.user.uid).get();
        if (rsvpsSnapshot.empty) return res.status(200).send([]);
        const rsvpData = rsvpsSnapshot.docs.map(doc => doc.data());
        const eventIds = [...new Set(rsvpData.map(rsvp => rsvp.eventId))];
        if (eventIds.length === 0) return res.status(200).send([]);
        const eventsSnapshot = await db.collection('events').where('id', 'in', eventIds).get();
        const eventsData = eventsSnapshot.docs.reduce((acc, doc) => ({ ...acc, [doc.id]: doc.data() }), {});
        const populatedRsvps = rsvpData.map(rsvp => ({ ...rsvp, event: eventsData[rsvp.eventId] || null }));
        res.status(200).send(populatedRsvps);
    } catch (error) {
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

module.exports = { getMe, requestRole, getMyRsvps };
