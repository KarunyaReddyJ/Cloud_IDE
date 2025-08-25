const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const workspaceController = require('../controller/Workspace.js');
const proxy = require('../utils/Proxy');
const testMiddleware = require('../middleware/test.js');
const { Logger } = require('../middleware/logger');
const fs = require('fs/promises')
const path = require('path');
const log = Logger('workspace.routes')
// Auth protected routes
log.debug('entered workspace routes')
router.get('/:id/preview', workspaceController.showPreview)

const mountPath = path.join(__dirname, '..', '..', '..', 'mount')

router.use(authMiddleware);

// Workspace lifecycle
router.post('/', workspaceController.createWorkspace);           // POST /api/workspace?base=js
router.delete('/:id', workspaceController.deleteWorkspace);     // DELETE /api/workspace/:id
router.get('/:id', workspaceController.getWorkspaceInfo);       // GET /api/workspace/:id

router.get('/:id/preview-url', workspaceController.generateDynamicPreviewURL)

// router.use('/:id/*path', testMiddleware, proxy)

// File operations (via proxy)  
router.get('/:id/file', async (req, res) => {
    const requestedPath = req.query.name?.replace(/^\/+/, ''); // remove leading slashes
    const workspaceId= req.params.id
    log.debug('requestedPath: ',req.query)
    if (!requestedPath) return res.status(400).send("Missing 'path' query param");

    // Prevent path traversal attack

    const fullPath = path.resolve(mountPath,`runtime-${workspaceId}` ,requestedPath);
     log.warn('fullPath: ',fullPath)
    if (!fullPath.startsWith(mountPath)) {
        return res.status(403).send("Access denied");
    }

    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        console.log('content', content)
        res.send({ content });
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to read file");
    }
});             // GET file tree or specific file
router.post('/:id/file', workspaceController.proxy);            // POST create/upload file
router.put('/:id/file', workspaceController.proxy);             // PUT update file
router.delete('/:id/file', workspaceController.proxy);          // DELETE file

const readFs = async (m_path, name) => {
    const stats = await fs.lstat(m_path);
    const obj = {
        id: m_path,
        isDir: stats.isDirectory(),
        name,
        children: []
    };

    if (obj.isDir) {
        const children = await fs.readdir(m_path);
        for (const child of children) {
            obj.children.push(await readFs(path.join(m_path, child), child))
        }
    }

    return obj;
};

router.get('/:id/files', async (req, res) => {
    const workspaceId = req.params.id
    const appPath = path.join(mountPath, `runtime-${workspaceId}`)
    // copy all files
    const fsTree = await readFs(appPath, `runtime-${workspaceId}`)
    return res.status(201).json({ fsTree: fsTree.children })
})

// Terminal or other resources (via proxy)
router.get('/:id/:resource', workspaceController.proxy);
router.post('/:id/:resource', workspaceController.proxy);
router.put('/:id/:resource', workspaceController.proxy);
router.delete('/:id/:resource', workspaceController.proxy);

log.debug('exited workspace routes')

module.exports = router;