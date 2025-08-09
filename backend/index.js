const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const pty = require('node-pty');
const path = require('path');
const { readFs } = require('./src/utils/readFs');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const cors = require('cors')
const chokidar = require('chokidar')
const logger = require('./src/middlewares/logger')

const fs = require('fs').promises;

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + '/user',
  env: process.env
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: '*'
}))
app.use(logger)
app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/files', async (req, res) => {
  const startPath = process.env.INIT_CWD
  const fsTree = await readFs(path.join(startPath, 'user'), 'user')
  return res.status(201).json({ fsTree: fsTree.children })
})

app.get('/file', async (req, res) => {

  const requestedPath = req.query.name?.replace(/^\/+/, ''); // remove leading slashes

  if (!requestedPath) return res.status(400).send("Missing 'path' query param");

  // Prevent path traversal attack
  const baseDir = path.resolve('./user');
  const fullPath = path.resolve(baseDir, requestedPath);

  if (!fullPath.startsWith(baseDir)) {
    return res.status(403).send("Access denied");
  }

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    console.log('content', content)
    res.send({ content });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to read file");
  }
});

chokidar
  .watch('./user', {
    ignored: /(^|[\/\\])node_modules/, // ignore any node_modules folder
    ignoreInitial: true,               // optional: skip initial add events
    persistent: true
  })
  .on('all', (event, path) => {
    io.emit('file:refresh', path)
    console.log('chokidar:', event, path);
  });


// Emit terminal output to all clients
ptyProcess.onData((data) => {
  console.log(data)
  io.emit('terminal:data', data);
});

// 🔥 All event listeners go inside connection callback
io.on('connection', (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);
  ptyProcess.write('clear\r');
  socket.on('terminal:write', (data) => {
    console.log('✍️ Terminal input received:', data);
    ptyProcess.write(data);
  });

  socket.on('file:write', async (data) => {
    console.log(data)
    try {
      const { path: relativePath, content } = data
      console.log('entered event', { path: relativePath, content })
      const requestedPath = relativePath?.replace(/^\/+/, '');

      // Defensive check
      if (!requestedPath) {
        socket.emit('file:error', { message: "Missing 'path' in payload" });
        return;
      }

      // Security check: prevent path traversal
      const baseDir = path.resolve('./user');
      const fullPath = path.resolve(baseDir, requestedPath);

      if (!fullPath.startsWith(baseDir)) {
        socket.emit('file:error', { message: "Access denied" });
        return;
      }

      await fs.writeFile(fullPath, content, 'utf-8');
      socket.emit('file:write:success', { path: relativePath });
    } catch (err) {
      console.error(err);
      socket.emit('file:error', { message: "Failed to write file", error: err.message });
    }
  })
  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

