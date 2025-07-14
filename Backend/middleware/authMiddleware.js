const { auth, db } = require('../firebaseConfig');

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Unauthorized. No token provided.' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;

    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const newUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || 'New User',
        role: 'pending_approval',
        createdAt: new Date(),
      };
      await userRef.set(newUser);
      req.user.role = newUser.role;
      req.user.isNewUser = true;
    } else {
      req.user.role = userDoc.data().role;
      req.user.isNewUser = false;
    }

    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(403).send({ message: 'Forbidden. Invalid token.' });
  }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).send({ message: 'Forbidden. Insufficient permissions.' });
        }
    };
};

module.exports = { authMiddleware, checkRole };

