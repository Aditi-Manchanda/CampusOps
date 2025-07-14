const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { db, auth, admin, storage };

