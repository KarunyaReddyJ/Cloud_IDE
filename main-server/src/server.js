require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const dockerClient = require('./utils/Docker');
const workspaceRoutes = require('./routes/workspace');
const workspacesRoutes = require('./routes/workspaces');
const runtimeRoutes = require('./routes/runtime');
const cors = require('cors')
const morgan = require('morgan');
const loggerMiddleware = require('./middleware/logger');
const staticProxy = require('./utils/Proxy');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(morgan('dev'));
app.use((req,res,next)=>{
  if(req.baseUrl.includes('api'))
   console.log('incoming req',req)
   next()
})
//app.use(loggerMiddleware);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/runtime', runtimeRoutes);
app.get('/api/check',async(req,res)=>{
//  console.log('incoming req',req)
  const response=await fetch('http://localhost:4000/proxy/runtime-8f513b8445a8db52/file?name=x.html')
  const parsedRes= await response.json()
  res.json(parsedRes)
})
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
