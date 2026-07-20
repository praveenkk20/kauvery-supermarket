const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin required' });
    next();
  });
}

module.exports = { authRequired, adminRequired };
