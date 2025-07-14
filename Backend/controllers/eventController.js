const { db, admin, storage } = require('../firebaseConfig');
const crypto = require('crypto');
const { sendRsvpConfirmation } = require('../services/emailService');

const createEvent = async (req, res) => {
    const { title, description, tags, startTime, endTime, venueId, rsvpDeadline, rsvpLimit } = req.body;
    const createdBy = req.user.uid;
    const posterFile = req.file;

    if (!title || !startTime || !endTime || !venueId) {
        return res.status(400).send({ message: "Missing required event fields." });
    }
    const startTimestamp = new Date(startTime);
    const endTimestamp = new Date(endTime);
    if (startTimestamp >= endTimestamp) {
        return res.status(400).send({ message: "Event start time must be before end time." });
    }

    try {
        let posterUrl = '';
        if (posterFile) {
            const bucket = storage.bucket();
            const fileName = `posters/${Date.now()}_${posterFile.originalname}`;
            const fileUpload = bucket.file(fileName);
            const blobStream = fileUpload.createWriteStream({ metadata: { contentType: posterFile.mimetype } });
            await new Promise((resolve, reject) => {
                blobStream.on('error', reject);
                blobStream.on('finish', () => {
                    posterUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                    resolve();
                });
                blobStream.end(posterFile.buffer);
            });
        }

        const bookingsRef = db.collection('bookings');
        const conflictQuery = await bookingsRef.where('roomId', '==', venueId).where('startTime', '<', endTimestamp).where('endTime', '>', startTimestamp).get();
        if (!conflictQuery.empty) {
            return res.status(409).send({ message: "Conflict: This room is already booked for the selected time." });
        }

        const roomRef = db.collection('rooms').doc(venueId);
        const roomDoc = await roomRef.get();
        if (!roomDoc.exists) return res.status(404).send({ message: "Selected room not found." });
        const roomData = roomDoc.data();
        const eventStatus = roomData.requiresApproval ? 'pending_approval' : 'approved';
        const eventRef = db.collection('events').doc();
        const bookingRef = db.collection('bookings').doc();

        await db.runTransaction(async (transaction) => {
            transaction.set(eventRef, {
                id: eventRef.id, title, description: description || '', tags: tags ? tags.split(',') : [],
                startTime: startTimestamp, endTime: endTimestamp, venueId, venueName: roomData.name,
                posterUrl, createdBy, createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: eventStatus, rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline) : null,
                rsvpLimit: rsvpLimit || 0, isPublic: eventStatus === 'approved',
            });
            transaction.set(bookingRef, {
                id: bookingRef.id, eventId: eventRef.id, roomId: venueId,
                startTime: startTimestamp, endTime: endTimestamp,
                status: eventStatus === 'approved' ? 'confirmed' : 'pending_approval',
            });
        });
        res.status(201).send({ message: "Event created successfully!", eventId: eventRef.id, status: eventStatus });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getAllPublicEvents = async (req, res) => {
    try {
        const { search, tag } = req.query;
        let query = db.collection('events').where('isPublic', '==', true).where('status', '==', 'approved');
        if (tag) query = query.where('tags', 'array-contains', tag);
        const snapshot = await query.orderBy('startTime', 'asc').get();
        let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (search) {
            events = events.filter(event => event.title.toLowerCase().includes(search.toLowerCase()));
        }
        res.status(200).send(events);
    } catch (error) {
        console.error("Error fetching public events:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const doc = await db.collection('events').doc(eventId).get();
        if (!doc.exists) return res.status(404).send({ message: 'Event not found' });
        res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const rsvpToEvent = async (req, res) => {
    const { eventId } = req.params;
    const { uid: userId, email: userEmail } = req.user;
    try {
        let eventData;
        const qrCodeHash = await db.runTransaction(async (transaction) => {
            const eventRef = db.collection('events').doc(eventId);
            const rsvpsRef = db.collection('rsvps');
            const existingRsvpQuery = await rsvpsRef.where('eventId', '==', eventId).where('userId', '==', userId).limit(1).get();
            if (!existingRsvpQuery.empty) throw new Error("You have already registered for this event.");
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists || eventDoc.data().status !== 'approved') throw new Error("Event is not available for registration.");
            eventData = eventDoc.data();
            if (eventData.rsvpDeadline && new Date() > eventData.rsvpDeadline.toDate()) throw new Error("The RSVP deadline has passed.");
            const rsvpSnapshot = await transaction.get(rsvpsRef.where('eventId', '==', eventId));
            if (eventData.rsvpLimit > 0 && rsvpSnapshot.size >= eventData.rsvpLimit) throw new Error("This event has reached its maximum capacity.");
            const newRsvpRef = rsvpsRef.doc();
            const hash = crypto.createHash('sha256').update(eventId + userId).digest('hex');
            transaction.set(newRsvpRef, {
                id: newRsvpRef.id, eventId, userId, qrCodeHash: hash,
                status: 'registered', registeredAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return hash;
        });
        await sendRsvpConfirmation(userEmail, eventData);
        res.status(201).send({ message: "Successfully registered!", qrCodeHash });
    } catch (error) {
        console.error("Error during RSVP:", error);
        res.status(400).send({ message: error.message });
    }
};

module.exports = { createEvent, getAllPublicEvents, getEventById, rsvpToEvent };

