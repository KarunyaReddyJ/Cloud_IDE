const { createServer } = require('http');
const { Server } = require('socket.io');
const Workspace = require('./models/Workspace');
const jwt = require('jsonwebtoken');
const app = require('./app');
const path = require('path');
const fs = require('fs/promises');
const chokidar = require('chokidar');
const { recordActivity } = require('./config/redis.config')
const { Logger } = require('./middleware/logger');
const { getInteractiveTerminal, startTheWorkspace, streamContainerStats } = require('./utils/Docker');

const server = createServer(app);
const log = Logger('socket.js')


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

const JWT_SECRET = process.env.JWT_SECRET;
const basePath = path.join(__dirname, '..', '..', 'mount');

// optional: ensure base mount dir exists at boot
(async () => {
  try {
    await fs.mkdir(basePath, { recursive: true });
  } catch (e) {
    log.error('Failed to ensure base mount dir', e);
  }
})();

let onlineCount = 0

io.on('connection', async (socket) => {


  // wrap everything in a try/catch to avoid unhandled rejections
  try {
    const { workspaceId, token } = socket.handshake.auth || {};

    log.debug('new connection', workspaceId, token)

    // 1) Verify JWT safely
    let payload;
    const containerName = `runtime-${workspaceId}`


    const socketOn = socket.on.bind(socket)

    socket.on = (...args) => {
      if (workspaceId !== null) recordActivity(workspaceId)
      log.info('[EVENT OCCURED]', ...args)
      socketOn(...args)
    }
    const socketEmit = socket.emit.bind(socket)

    socket.emit = (...args) => {
      if (workspaceId !== null) recordActivity(workspaceId)
      log.info('[EVENT OCCURED]', ...args)
      socketEmit(...args)
    }
    try {
      payload = jwt.verify(token || '', JWT_SECRET);
      log.debug('payload: ', payload)
    } catch (err) {
      log.error('auth:error', { message: 'Invalid or expired token' })
      socket.emit('auth:error', { message: 'Invalid or expired token' });
      socket.disconnect(true);
      return;
    }

    // adapt if you encode user id differently in token
    const userIdFromToken = payload.sub || payload.userId || payload._id || payload.id || payload;

    if (!userIdFromToken) {
      socket.emit('auth:error', { message: 'Invalid token payload' });
      log.error('auth:error', { message: 'Invalid token payload' })
      socket.disconnect(true);
      return;
    }

    // 2) Load workspace and authorize
    const workspace = await Workspace.findOne({ id: workspaceId, user: userIdFromToken }).lean();
    if (!workspace) {
      socket.emit('workspace:error', { message: 'Workspace not found' });
      log.error('workspace:error', { message: 'Workspace not found' });
      socket.disconnect(true);
      return;
    }

    // Normalize to strings for compare
    const owner = String(workspace.user);
    const viewer = String(userIdFromToken);
    log.debug({ owner, viewer })
    if (owner !== viewer) {
      socket.emit('workspace:error', { message: 'Not authorized for this workspace' });
      log.error('workspace:error', { message: 'Not authorized for this workspace' });
      socket.disconnect(true);
      return;
    }
    await startTheWorkspace(containerName)


    let shell = await getInteractiveTerminal(containerName);

    streamContainerStats(containerName, socket)
    // Clear screen once terminal attaches
    shell.write("clear\n");

    // When client sends keystrokes/commands
    socket.on("terminal:write", (data) => {
      log.debug("command: ", data);
      shell.write(data);
    });

    // When container shell outputs data
    shell.on("data", (data) => {
      log.debug("data: ", data.toString());
      socket.emit("terminal:data", data.toString()); // ensure it's string
    });


    onlineCount++

    log.log(`${socket.id} connected to workspace ${workspaceId}`);
    io.emit('online-count', { count: onlineCount })
    // 3) Compute and ensure watch path
    const watchPath = path.join(basePath, containerName);

    // If the path might not exist yet (e.g., container create failed), guard:
    try {
      await fs.mkdir(watchPath, { recursive: true });
    } catch (e) {
      log.warn('Could not ensure watch path', watchPath, e.message);
    }





    // Optional: verify existence before watching
    let watching = false;
    try {
      // throws if not exists
      await fs.stat(watchPath);

      // 4) Start chokidar watcher
      const watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])node_modules/,
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      watching = true;

      const emitRefresh = (eventPath) => {
        // emit only relative paths to avoid leaking host structure
        log.debug('event occured: ', eventPath)
        const rel = path.relative(watchPath, eventPath);
        socket.emit('file:refresh', { path: rel });
      };

      watcher
        .on('add', emitRefresh)
        .on('change', emitRefresh)
        .on('unlink', emitRefresh)
        .on('addDir', emitRefresh)
        .on('unlinkDir', emitRefresh)
        .on('error', (err) => {
          log.error('chokidar error:', err);
          socket.emit('watch:error', { message: 'File watcher error' });
        });



      socket.on('file:write', async (data) => {
        try {
          const { path: relPath, content } = data;

          // Construct absolute path safely
          const filePath = path.resolve(watchPath, relPath);

          // Ensure filePath is still inside watchPath (prevent traversal)
          if (!filePath.startsWith(path.resolve(watchPath))) {
            log.warn("Unauthorized file write attempt:", filePath);
            socket.emit("error", { message: "Invalid file path" });
            return;
          }

          // Replace file content
          await fs.writeFile(filePath, content, "utf8");

          log.info("File written:", filePath);
          socket.emit("file:write:success", { path: filePath });
        } catch (err) {
          log.error("File write error:", err);
          socket.emit("file:write:error", { err: err.message });
        }
      })
      // Clean up watcher on disconnect
      socket.on('disconnect', async () => {
        try {
          await watcher.close();
        } catch (e) {
          // ignore
        }
        log.info(`${socket.id} left workspace ${workspaceId}`);
      });
    } catch (e) {
      // Not fatal; notify client so it can retry later
      socket.emit('watch:pending', { message: 'Workspace directory not ready yet' });
      log.warn('Watch path not ready:', watchPath);
    }
  } catch (err) {
    log.error('socket connection error:', err.message);
    // Best-effort notify and close; ensure we don’t continue
    try {
      socket.emit('server:error', { message: 'Internal error' });
    } catch { }
    socket.disconnect(true);
    return;
  }
});

module.exports = server;
