const mongoose = require('mongoose');

const runtimeSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  defaultCommand: {
    type: String,
    required: true
  },
  exec: {
    type: [String], 
   
  },
  dockerfileTemplate: {
    type: String,
   
  }
});

module.exports = mongoose.model('Runtime', runtimeSchema);
