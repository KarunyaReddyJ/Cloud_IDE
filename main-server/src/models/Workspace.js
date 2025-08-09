const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    serviceName: { type: String, required: true },
    language: { type: String, required: true },
    limits: {
        time: Number,
        memory: Number
    },
    privileges: String,
    createdAt: Date
});

module.exports = mongoose.model('Workspace', workspaceSchema);