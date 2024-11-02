// Load environment variables from .env file
require('dotenv').config();

// Export the configuration settings
module.exports = {
  secretKey: process.env.JWT_SECRET_KEY,
  environment: process.env.NODE_ENV || 'development'
};