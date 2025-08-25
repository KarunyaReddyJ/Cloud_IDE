// config/db.config.js
const mongoose = require('mongoose');
const { Logger } = require('../middleware/logger')
const URI = process.env.MONGO_URI;
const log = Logger('db.config')
function connectDB() {
  log.log('Attempting MongoDB connection...');
  return mongoose.connect(URI)
    .then((conn) => {
      log.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((err) => {
      log.error('MongoDB Connection Failed');
      log.error('Error Name:', err.name);
      log.error('Error Message:', err.message);
      log.error('Error Stack:', err.stack);
      throw err;
    });
}

module.exports = connectDB;
