const { db, admin } = require('../firebaseConfig');
const { sendEventDecision } = require('../services/emailService');

const getRoleRequests = async (req, res) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('role', '==', 'pending_approval').where('requestedRole', '!=', null).get();
        if (snapshot.empty) return res.status(200).send([]);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    } catch (error) {
        console.error("Error fetching role requests:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

const decideRole = async (req, res) => {
    const { userId, decision } = req.body;
    if (!userId || !decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).send({ message: 'User ID and a valid decision (approve/reject) are required.' });
    }
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return res.status(404).send({ message: 'User not found.' });
        const userData = userDoc.data();
        const newRole = decision === 'approve' ? userData.requestedRole : 'student';
        await userRef.update({
            role: newRole,
            requestedRole: admin.firestore.FieldValue.delete()
        });
        res.status(200).send({ message: `User role has been updated to ${newRole}.` });
    } catch (error) {
        console.error("Error deciding role:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

const getPendingEvents = async (req, res) => {
    try {
        const eventsRef = db.collection('events');
        const snapshot = await eventsRef.where('status', '==', 'pending_approval').get();
        if (snapshot.empty) return res.status(200).send([]);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(requests);
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

const decideEvent = async (req, res) => {
    const { eventId, decision, rejectionReason } = req.body;
    if (!eventId || !decision || !['approve', 'reject'].includes(decision)) {
        return res.status(400).send({ message: 'Event ID and a valid decision are required.' });
    }
    if (decision === 'reject' && !rejectionReason) {
        return res.status(400).send({ message: 'A reason is required for rejection.' });
    }
    const eventRef = db.collection('events').doc(eventId);
    const bookingQuery = db.collection('bookings').where('eventId', '==', eventId).limit(1);
    try {
        let eventData;
        await db.runTransaction(async (transaction) => {
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists) throw new Error("Event not found!");
            eventData = eventDoc.data();
            const bookingSnapshot = await transaction.get(bookingQuery);
            if (bookingSnapshot.empty) throw new Error("Associated booking not found!");
            const bookingRef = bookingSnapshot.docs[0].ref;
            if (decision === 'approve') {
                transaction.update(eventRef, { status: 'approved', isPublic: true });
                transaction.update(bookingRef, { status: 'confirmed' });
            } else {
                transaction.update(eventRef, { status: 'rejected', rejectionReason: rejectionReason });
                transaction.delete(bookingRef);
            }
        });
        const creatorDoc = await db.collection('users').doc(eventData.createdBy).get();
        if (creatorDoc.exists) {
            await sendEventDecision(creatorDoc.data().email, { ...eventData, rejectionReason }, decision);
        }
        res.status(200).send({ message: `Event has been successfully ${decision}d.` });
    } catch (error) {
        console.error("Error deciding on event:", error.message);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

const checkInUser = async (req, res) => {
    const { qrCodeHash } = req.body;
    if (!qrCodeHash) return res.status(400).send({ message: "QR Code data is required." });
    try {
        const rsvpQuery = await db.collection('rsvps').where('qrCodeHash', '==', qrCodeHash).limit(1).get();
        if (rsvpQuery.empty) return res.status(404).send({ message: "Invalid QR Code. RSVP not found." });
        const rsvpDoc = rsvpQuery.docs[0];
        if (rsvpDoc.data().status === 'checked_in') {
            return res.status(409).send({ message: "This QR Code has already been used." });
        }
        await rsvpDoc.ref.update({ status: 'checked_in' });
        const userDoc = await db.collection('users').doc(rsvpDoc.data().userId).get();
        const userName = userDoc.exists ? userDoc.data().displayName : 'Unknown User';
        res.status(200).send({ message: `Successfully checked in ${userName}.` });
    } catch (error) {
        console.error("Error during check-in:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = { getRoleRequests, decideRole, getPendingEvents, decideEvent, checkInUser };

