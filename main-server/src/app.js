const express = require('express');
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspace');
const workspacesRoutes = require('./routes/workspaces');
const runtimeRoutes = require('./routes/runtime');
const cors = require('cors')
const morgan = require('morgan');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
//app.use(loggerMiddleware);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/runtime', runtimeRoutes);

module.exports = app