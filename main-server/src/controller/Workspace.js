const Workspace = require('../models/Workspace');
const dockerClient = require('../config/docker.config');
const workspaceProxy = require('../utils/Proxy');
const crypto = require('crypto');
const Runtime = require('../models/Runtime');
const jwt = require('jsonwebtoken')
const { Readable } = require("stream")
const path = require('path');
const fs = require("fs/promises");
const { Logger } = require('../middleware/logger')

const mountBasePath = path.join(__dirname, '..', '..', '..', 'mount');
const log = Logger('workspace controller')

exports.createWorkspace = async (req, res) => {
  const { language, name } = req.body;
  log.debug({ language, name })
  const user = req.user;

  if (!language) {
    return res.status(400).json({ error: "Language required" });
  }

  // Lookup runtime image from DB
  const runtime = await Runtime.findOne({ language });
  if (!runtime) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  let imageName = runtime.image.replace(/[^\x20-\x7E]/g, "").trim();
  if (!imageName.includes(":")) {
    imageName += ":latest";
  }

  const id = crypto.randomBytes(8).toString("hex");
  const serviceName = `runtime-${id}`;

  // Ensure image exists (pull if needed)
  try {
    const image = await dockerClient.getImage(imageName);
    try {
      await image.inspect();
      log.info("Image found locally, skipping pull.");
    } catch (err) {
      log.info("Image not found locally, pulling...");
      await new Promise((resolve, reject) => {
        dockerClient.pull(imageName, (err, stream) => {
          if (err) return reject(err);
          dockerClient.modem.followProgress(stream, (err, output) => {
            if (err) return reject(err);
            resolve(output);
          });
        });
      });
    }
  } catch (error) {
    log.error("❌ Error while pulling image ", imageName, error.message);
  }

  // Workspace setup
  const workspaceDir = path.join(mountBasePath, serviceName);

  try {
    await fs.mkdir(workspaceDir, { recursive: true });
    await fs.chmod(workspaceDir, 0o777); // force mode


    // Determine template dir based on image name
    const imageBase = imageName.split(":")[0]; // e.g. node:20 -> "node"
    const templateDir = path.join(__dirname, "..", "templates", imageBase);

    log.debug({ workspaceDir, templateDir });

    try {
      await fs.cp(templateDir, workspaceDir, { recursive: true });
      log.info(`✅ Copied template from ${templateDir} to ${workspaceDir}`);
    } catch (copyErr) {
      log.warn(`⚠️ No template found for ${imageBase}, skipping copy.`, copyErr.message);
    }
  } catch (mkdirErr) {
    return res.status(500).json({ error: `Failed to create mount directory: ${mkdirErr.message}` });
  }

  // Container options
  const containerOptions = {
    Image: imageName,
    name: serviceName,
    Tty: true,
    HostConfig: {
      NetworkMode: "cloud_ide_net",
      Memory: 256 * 1024 * 1024, // 256MB
      CpuPeriod: 100000,
      CpuQuota: 50000, // ~0.5 CPU
      Binds: [
        // ⚠️ Windows paths: use //c/... instead of C:/...
        `//c/Users/Karunya Kumar/projects/Cloud-IDE/mount/${serviceName}:/app`,
      ],
    },
  };

  log.debug(containerOptions);

  // Retry loop for container creation
  let tries = 3,
    err = null;

  while (tries > 0) {
    try {
      const container = await dockerClient.createContainer(containerOptions);
      log.debug(`${serviceName} created`);

      await container.start();
      log.debug(`${serviceName} started`);

      await Workspace.create({
        id,
        name,
        language,
        user: user.id,
        serviceName,
        createdAt: new Date(),
        limits: { time: 600, memory: 256 },
        privileges: "non-root",
      });

      log.info("🚀 Successfully created container:", serviceName);

      return res.json({
        id,
        name,
        createdAt: new Date(),
        language,
      });
    } catch (error) {
      tries--;
      err = error;
      log.error("❌ Error while creating container:", error.message);

      // Cleanup workspace dir if container failed
      try {
        await fs.rm(workspaceDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        log.error(`⚠️ Failed to cleanup workspace dir: ${cleanupErr.message}`);
      }

      if (tries === 0) {
        return res.status(500).json({ error: err.message });
      }
    }
  }
};


exports.deleteWorkspace = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const workspace = await Workspace.findOne({ id, user: user.id });
  if (!workspace) return res.status(404).json({ error: 'Not found' });

  try {
    const container = dockerClient.getContainer(workspace.serviceName);
    const workspaceDir = path.join(mountBasePath, serviceName);

    if (container)
      await container.stop();
    await container.remove();
    await workspace.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWorkspaceInfo = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const workspace = await Workspace.findOne({ id, user: user.id });
  if (!workspace) return res.status(404).json({ error: 'Not found' });
  res.json(workspace);
};

exports.showPreview = async (req, res) => {
  const { token } = req.query;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.workspaceId !== req.params.id) {
      return res.status(403).json({ error: "Invalid workspace" });
    }

    const targetUrl = `http://runtime-${payload.workspaceId}:3000`;
    const response = await fetch(targetUrl);

    const nodeStream = Readable.fromWeb(response.body);

    // Copy headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Pipe
    res.status(response.status);
    nodeStream.pipe(res);

  } catch (err) {
    log.error(err);
    res.status(500).send("Proxy error");
  }
};


exports.generateDynamicPreviewURL = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const workspace = await Workspace.findOne({ id, user: user.id });
    if (!workspace) return res.status(404).json({ error: 'Not found' });


    const token = jwt.sign({ workspaceId: id, userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const url = `/api/workspace/${id}/preview?token=${token}`;
    res.json({ url });
  } catch (err) {
    log.error(err);
    res.status(500).send("Proxy error");
  }
};


exports.getAllFiles = async (req, res) => {

}


exports.proxy = workspaceProxy