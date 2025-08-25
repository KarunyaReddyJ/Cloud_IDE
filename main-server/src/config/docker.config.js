const Docker = require('dockerode');
const docker = new Docker(); // Uses default socket: /var/run/docker.sock

module.exports = docker;