const Workspace = require('../models/Workspace');
const dockerClient = require('../utils/Docker');
const workspaceProxy = require('../utils/Proxy');
const crypto = require('crypto');
const Runtime = require('../models/Runtime');
const jwt = require('jsonwebtoken')
const { Readable } =require("stream")
exports.createWorkspace = async (req, res) => {
  const { language, name } = req.body;
  const user = req.user;
  if (!language) return res.status(400).json({ error: 'Language required' });

  const runtime = await Runtime.findOne({ language });
  if (!runtime) return res.status(400).json({ error: 'Unsupported language' });
  const imageNameFromDB = runtime.image
  let imageName = imageNameFromDB.replace(/[^\x20-\x7E]/g, '').trim();

  if (!imageName.includes(':')) {
    imageName += ':latest';
  }

  console.log('fromDB: ', JSON.stringify(imageName))
  console.log('which is working: embedded-server-nodejs:latest')
  console.log(imageName === 'embedded-server-nodejs:latest')
  //res.send(runtime.image)
  const id = crypto.randomBytes(8).toString('hex');
  const serviceName = `runtime-${id}`;

  try {
    const image = await dockerClient.getImage(imageName);
    try {
      await image.inspect();
      console.log('Image found locally, skipping pull.');
    } catch (err) {
      console.log('Image not found locally, pulling...');
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
    console.error('error while pulling ', imageName, error.message)
  }

  const containerOptions = {
    Image: imageName,
    name: serviceName,
    Tty: true,
    HostConfig: {
      NetworkMode: 'cloud_ide_net',
      Memory: 256 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 50000
    }
  };

  let tries = 5, err = null
  while (tries > 0) {
    try {
      const container = await dockerClient.createContainer(containerOptions);
      await container.start();

      await Workspace.create({
        id,
        name,
        language,
        user: user.id,
        serviceName,
        createdAt: new Date(),
        limits: { time: 600, memory: 256 },
        privileges: 'non-root'
      });
      return res.json({ id, name, createdAt: new Date(), language });
    } catch (error) {
      tries--;
      err = error
    }
    res.status(500).json({ error: err.message });
  }

};
exports.deleteWorkspace = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const workspace = await Workspace.findOne({ id, user: user.id });
  if (!workspace) return res.status(404).json({ error: 'Not found' });

  try {
    const container = dockerClient.getContainer(workspace.serviceName);
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

    const targetUrl = `http://runtime-${payload.workspaceId}:10000`;
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
    console.error(err);
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
    console.error(err);
    res.status(500).send("Proxy error");
  }
};



exports.proxy = workspaceProxy