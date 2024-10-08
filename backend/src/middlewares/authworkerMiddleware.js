const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/index.js'); // Adjust the path to your config file

exports.authenticateWorkerToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header
  console.log(token)
  if (token == null) {
    console.log('No token found in Authorization header'); // Log if no token is found
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, payload) => {
    if (err) {
      console.log('JWT Verification Error:', err); // Log the error
      return res.sendStatus(403);
    }
    // console.log(token)
    const workerId = payload.worker_id; // Extract the worker_id from the payload
    req.worker = { id: workerId }; // Set the req.user property with the worker_id
    // console.log(workerId)
    next();
  });
};
