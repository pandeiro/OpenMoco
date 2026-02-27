/**
 * Reformulation route.
 * POST /api/reform — transcript + context → clean agent prompt.
 */

import { Router } from 'express';
import { reformulate } from '../lib/reformulate.js';
import { readJSON } from '../lib/data.js';

const router = Router();

/**
 * POST /api/reform
 * Body: { transcript, project: { name, description, defaultBranch, lastPushed } }
 * Returns: { prompt, slug? }
 */
router.post('/reform', async (req, res) => {
    console.log('[reform] POST /api/reform - body:', JSON.stringify(req.body, null, 2));
    try {
        const { transcript, project } = req.body;

        if (!transcript) {
            console.log('[reform] ERROR: Missing transcript');
            return res.status(400).json({ error: 'Missing transcript' });
        }

        if (!project?.name) {
            console.log('[reform] ERROR: Missing project context. Project:', project);
            return res.status(400).json({ error: 'Missing project context' });
        }

        // Get list of other enabled repos for context
        const repos = (await readJSON('repos.json')) || {};
        const enabledRepos = Object.entries(repos)
            .filter(([name, r]) => r.enabled && name !== project.name)
            .map(([name, r]) => ({ name, ...r.githubMeta }));

        const result = await reformulate(transcript, project, enabledRepos);

        res.json(result);
    } catch (err) {
        console.error('POST /api/reform error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
