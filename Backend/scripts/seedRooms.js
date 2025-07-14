const { db } = require('../firebaseConfig');

const roomData = [
    { name: "1201", capacity: 158, requiresApproval: true }, { name: "1202", capacity: 100, requiresApproval: true },
    { name: "1203", capacity: 84, requiresApproval: true }, { name: "1204", capacity: 98, requiresApproval: true },
    { name: "1205", capacity: 86, requiresApproval: true }, { name: "1219", capacity: 46, requiresApproval: true },
    { name: "1220", capacity: 46, requiresApproval: true }, { name: "1223", capacity: 132, requiresApproval: true },
    { name: "1225", capacity: 46, requiresApproval: true }, { name: "1226", capacity: 106, requiresApproval: true },
    { name: "1227", capacity: 172, requiresApproval: true }, { name: "1231", capacity: 76, requiresApproval: true },
    { name: "1232", capacity: 76, requiresApproval: true }, { name: "1233", capacity: 162, requiresApproval: true },
    { name: "1234", capacity: 162, requiresApproval: true }, { name: "2201", capacity: 110, requiresApproval: true },
    { name: "2203", capacity: 80, requiresApproval: true }, { name: "2204", capacity: 120, requiresApproval: true },
    { name: "2206", capacity: 110, requiresApproval: true }, { name: "2207", capacity: 80, requiresApproval: true },
    { name: "5101", capacity: 250, requiresApproval: true }, { name: "5102", capacity: 450, requiresApproval: true },
    { name: "5104", capacity: 50, requiresApproval: false, type: "Conference Room" }, { name: "5105", capacity: 450, requiresApproval: true },
    { name: "5106", capacity: 250, requiresApproval: true }, { name: "6101", capacity: 110, requiresApproval: true },
    { name: "6109", capacity: 200, requiresApproval: true, type: "NAB Audi" },
];

async function seedRooms() {
  console.log('Seeding rooms...');
  const promises = roomData.map(room => db.collection('rooms').doc(room.name).set(room));
  await Promise.all(promises);
  console.log('Finished seeding rooms.');
}

seedRooms().catch(console.error);

