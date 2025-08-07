require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dockerClient = require('./utils/Docker');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

// Test Docker SDK: List all containers
app.get('/api/docker/containers',async (req, res) => {
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
