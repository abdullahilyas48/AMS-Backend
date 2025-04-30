const jwt = require('jsonwebtoken');
const JWT_SECRET = 'token'; // Make sure this matches the one in your login route

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = user; // Attach decoded token payload
    next();
  });
}

module.exports = authenticateToken;
