const { db } = require('../firebaseConfig');

const getAllRooms = async (req, res) => {
    try {
        const snapshot = await db.collection('rooms').orderBy('name').get();
        const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getRoomBookings = async (req, res) => {
    const { roomId, date } = req.query;
    if (!roomId || !date) return res.status(400).send({ message: "Room ID and date are required." });
    try {
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
        const snapshot = await db.collection('bookings').where('roomId', '==', roomId).where('startTime', '>=', startOfDay).where('startTime', '<=', endOfDay).get();
        const bookings = snapshot.docs.map(doc => doc.data());
        res.status(200).send(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = { getAllRooms, getRoomBookings };

