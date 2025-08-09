const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const workspacesController = require('../controller/Workspaces.js');

// Auth protected routes
router.use(authMiddleware);

router.get('/', workspacesController.getWorkspaces);      


module.exports = router;