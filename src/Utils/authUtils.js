// authUtils.js
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require("uuid");

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

const generateLongToken = () => {
  const uuid = uuidv4();

  // more randomness to make the token longer
  const extraRandomData = Math.random().toString(36).substring(2);

  const longToken = uuid + extraRandomData;

  return longToken;
};


const verifyToken = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
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


const generateRefreshToken = () => {
  const refreshToken = jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: "7d", // Set your desired expiration time
  });

  console.log('Generated Refresh Token:', refreshToken);

  return refreshToken;
};
module.exports = {
  generateAccessToken,
  verifyToken,
  generateRefreshToken,
  generateLongToken,
};
