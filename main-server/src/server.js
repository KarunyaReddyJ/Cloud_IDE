require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dockerClient = require('./utils/Docker');
const workspaceRoutes = require('./routes/workspace');
const runtimeRoutes = require('./routes/runtime');
const cors = require('cors')
const morgan = require('morgan');
const loggerMiddleware = require('./middleware/logger');
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(loggerMiddleware);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/runtime', runtimeRoutes);
// Test Docker SDK: List all containers
app.get('/api/docker/containers', async (req, res) => {
  try {
    const containers = await dockerClient.listContainers({ all: true });
    res.json(containers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error(err));
