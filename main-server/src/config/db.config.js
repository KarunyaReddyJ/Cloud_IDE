// config/db.config.js
const mongoose = require('mongoose');

const URI = process.env.MONGO_URI;

function connectDB() {
  console.log('Attempting MongoDB connection...');
  return mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    throw err; 
  });
}

module.exports = connectDB;
