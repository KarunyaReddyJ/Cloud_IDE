const express = require('express');
const router = express.Router();
const Runtime = require('../models/Runtime');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleare');

router.use(authMiddleware)

router.get('/', async (req, res) => {
    try {
        const languages = await Runtime.find({}, 'language'); // only fetch language field
        const languageList = languages.map(rt => rt.language);
        res.json(languageList);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch runtimes' });
    }
});

router.use(adminMiddleware)

router.post('/', async (req, res) => {
    try {
        const runtime = await Runtime.create(req.body);
        res.status(201).json(runtime);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;