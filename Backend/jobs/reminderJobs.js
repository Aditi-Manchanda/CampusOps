const cron = require('node-cron');
const { db } = require('../firebaseConfig');
const { sendEventReminder } = require('../services/emailService');

const start = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily reminder job...');
        const now = new Date();
        const tomorrowStart = new Date(now); tomorrowStart.setDate(now.getDate() + 1); tomorrowStart.setHours(0, 0, 0, 0);
        const tomorrowEnd = new Date(now); tomorrowEnd.setDate(now.getDate() + 1); tomorrowEnd.setHours(23, 59, 59, 999);
        try {
            const eventsSnapshot = await db.collection('events').where('startTime', '>=', tomorrowStart).where('startTime', '<=', tomorrowEnd).where('status', '==', 'approved').get();
            if (eventsSnapshot.empty) return console.log('No events tomorrow.');
            for (const eventDoc of eventsSnapshot.docs) {
                const event = eventDoc.data();
                const rsvpsSnapshot = await db.collection('rsvps').where('eventId', '==', event.id).get();
                if (rsvpsSnapshot.empty) continue;
                const userIds = [...new Set(rsvpsSnapshot.docs.map(doc => doc.data().userId))];
                if (userIds.length === 0) continue;
                const usersSnapshot = await db.collection('users').where('uid', 'in', userIds).get();
                for (const userDoc of usersSnapshot.docs) {
                    await sendEventReminder(userDoc.data().email, event);
                }
            }
        } catch (error) {
            console.error('Error in reminder cron job:', error);
        }
    });
};

module.exports = { start };

