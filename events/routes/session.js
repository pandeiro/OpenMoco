/**
 * Session routes.
 * POST /api/session/create   — create OpenCode session + send prompt
 * GET  /api/session/active   — get current active session
 */

import { Router } from 'express';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { createAndPrompt, promptActiveSession } from '../lib/session.js';
import { readJSON } from '../lib/data.js';

const router = Router();

/**
 * POST /api/session/create
 * Body: { projectPath, prompt, branch?, slug?, repo?, notificationsEnabled? }
 */
router.post('/create', async (req, res) => {
    try {
        const { projectPath, prompt, branch, slug, repo, notificationsEnabled, isNewProject } = req.body;

        if (!projectPath || !prompt) {
            return res.status(400).json({ error: 'Missing projectPath or prompt' });
        }

        if (isNewProject) {
            if (!existsSync(projectPath)) {
                mkdirSync(projectPath, { recursive: true });
                execSync('git init', { cwd: projectPath, stdio: 'pipe' });
            }
        }

        const result = await createAndPrompt({
            projectPath,
            prompt,
            branch,
            slug,
            repo,
            notificationsEnabled,
        });

        res.json(result);
    } catch (err) {
        console.error('POST /api/session/create error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/session/active
 * Returns the current active session or null.
 */
router.get('/active', async (_req, res) => {
    try {
        const session = await readJSON('active_session.json');
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/session/prompt
 * Body: { text }
 * Send a follow-up prompt to the active session (for CI failure forwarding).
 */
router.post('/prompt', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        const result = await promptActiveSession(text);
        res.json(result);
    } catch (err) {
        console.error('POST /api/session/prompt error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
