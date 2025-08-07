const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const workspaceController = require('../controller/Workspace.js');

// Auth protected routes
router.use(authMiddleware);

// Workspace lifecycle
router.post('/', workspaceController.createWorkspace);           // POST /api/workspace?base=js
router.delete('/:id', workspaceController.deleteWorkspace);     // DELETE /api/workspace/:id
router.get('/:id', workspaceController.getWorkspaceInfo);       // GET /api/workspace/:id

// File operations (via proxy)
router.get('/:id/file', workspaceController.proxy);             // GET file tree or specific file
router.post('/:id/file', workspaceController.proxy);            // POST create/upload file
router.put('/:id/file', workspaceController.proxy);             // PUT update file
router.delete('/:id/file', workspaceController.proxy);          // DELETE file

// Terminal or other resources (via proxy)
router.get('/:id/:resource', workspaceController.proxy);
router.post('/:id/:resource', workspaceController.proxy);
router.put('/:id/:resource', workspaceController.proxy);
router.delete('/:id/:resource', workspaceController.proxy);

module.exports = router;