const Workspace = require('../models/Workspace');
const dockerClient = require('../utils/Docker');
const proxy = require('../utils/Proxy');
const crypto = require('crypto');
const Runtime = require('../models/Runtime');

exports.createWorkspace = async (req, res) => {
  const { language } = req.body;
  const user = req.user;
  if (!language) return res.status(400).json({ error: 'Language required' });

  const runtime = await Runtime.findOne({ language });
  if (!runtime) return res.status(400).json({ error: 'Unsupported language' });

  const id = crypto.randomBytes(8).toString('hex');
  const serviceName = `runtime-${id}`;
  const containerOptions = {
    Image: runtime.image,
    name: serviceName,
    Tty: true,
    HostConfig: {
      NetworkMode: 'cloud_ide_net',
      Memory: 256 * 1024 * 1024,
      CpuPeriod: 100000,
      CpuQuota: 50000
    }
  };

  try {
    await new Promise((resolve, reject) => {
      dockerClient.pull(runtime.image, (err, stream) => {
        if (err) return reject(err);
        dockerClient.modem.followProgress(stream, (err, output) => {
          if (err) return reject(err);
          resolve(output);
        });
      });
    });

    const container = await dockerClient.createContainer(containerOptions);
    await container.start();

    await Workspace.create({
      id,
      user: user.id,
      serviceName,
      createdAt: new Date(),
      limits: { time: 600, memory: 256 },
      privileges: 'non-root'
    });

    res.json({ id });
  } catch (err) {
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

exports.proxy = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const workspace = await Workspace.findOne({ id, user: user.id });
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

  req.url = req.originalUrl.replace(`/api/workspace/${id}`, '');
  proxy.web(req, res, {
    target: `http://${workspace.serviceName}:3000`,
    changeOrigin: true
  });
};