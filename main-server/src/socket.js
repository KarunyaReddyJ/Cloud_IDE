const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: clientIo } = require('socket.io-client');
const util = require('util');
const app = require('./app');

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (clientSocket) => {
  console.log('Client connected:', clientSocket.id);

  let backendSocket = null;

  const forwardClientToBackend = (event, ...args) => {
    if (event === 'workspace:join') return;
    console.log(
      `\x1b[33m[Client ${clientSocket.id} → Backend]\x1b[0m Event: "${event}" Args:`,
      util.inspect(args, { depth: null, colors: true })
    );
    if (backendSocket && backendSocket.connected) {
      backendSocket.emit(event, ...args);
    }
  };

  clientSocket.on('workspace:join', (data) => {
    const { workspaceId } = data;
    console.log(`Client ${clientSocket.id} joining workspace ${workspaceId}`);

    if (backendSocket) {
      backendSocket.removeAllListeners();
      backendSocket.disconnect();
    }

    backendSocket = clientIo(`http://runtime-${workspaceId}:3000`);

    backendSocket.on('connect', () => {
      console.log(`Connected to backend for workspace ${workspaceId}`);
    });

    backendSocket.onAny((event, ...args) => {
      console.log(
        `\x1b[36m[Backend → Client ${clientSocket.id}]\x1b[0m Event: "${event}" Args:`,
        util.inspect(args, { depth: null, colors: true })
      );
      clientSocket.emit(event, ...args);
    });

    backendSocket.on('disconnect', () => {
      console.log(`Backend disconnected for workspace ${workspaceId}`);
      clientSocket.emit('backendDisconnected');
    });

    // Remove any old clientSocket.onAny before re-adding
    clientSocket.offAny(forwardClientToBackend);
    clientSocket.onAny(forwardClientToBackend);
  });

  clientSocket.on('workspace:exit', () => {
    if (backendSocket) {
      backendSocket.removeAllListeners();
      backendSocket.disconnect();
      backendSocket = null;
    }
    clientSocket.offAny(forwardClientToBackend); // <-- prevent duplication
  });

  clientSocket.on('disconnect', () => {
    console.log('Client disconnected:', clientSocket.id);
    if (backendSocket) {
      backendSocket.removeAllListeners();
      backendSocket.disconnect();
    }
    clientSocket.offAny(forwardClientToBackend); // cleanup on disconnect too
  });
});

module.exports = server