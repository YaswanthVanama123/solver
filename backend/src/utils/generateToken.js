const jwt = require('jsonwebtoken');
const { secretKey } = require('../config/index.js');

exports.generateToken = (user) => {
  console.log("user token",user)
  return jwt.sign({ user_id: user.user_id }, secretKey, { expiresIn: '5000d' });
};


exports.generateWorkerToken = (worker) => {
  console.log("worker token",worker)
  return jwt.sign({ worker_id: worker.worker_id }, secretKey, { expiresIn: '50000d' });

};