// authUtils.js

const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    name: user.name,
  };

  const options = {
    expiresIn: '50m',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  console.log('Generated Token:', token);

  return token;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader); 

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Invalid token: Token not found'); 
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken);
    req.user = decodedToken; 
    next(); 
  } catch (err) {
    console.log('Invalid token: Verification failed'); 
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyToken, generateAccessToken };
