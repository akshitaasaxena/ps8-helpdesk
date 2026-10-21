const jwt = require('jsonwebtoken');
const authHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Please login first' });
  }
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : header;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
module.exports = authHandler;
