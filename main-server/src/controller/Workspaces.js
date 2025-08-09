const Workspace = require('../models/Workspace');
const proxy = require('../utils/Proxy');


exports.getWorkspaces = async (req, res) => {
  const user = req.user;
  const workspaces = await Workspace.find({ user: user.id });
  if (workspaces.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(workspaces);
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