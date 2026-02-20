/**
 * Repo management routes.
 * GET  /api/repos            — list repos (GitHub + local state)
 * POST /api/repos/:name/enable  — clone and enable
 * POST /api/repos/:name/disable — remove and disable
 */

import { Router } from 'express';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { listRepos } from '../lib/github.js';
import { readJSON, writeJSON } from '../lib/data.js';

const router = Router();

/**
 * GET /api/repos
 * Merge GitHub repos with local enabled state.
 */
router.get('/', async (_req, res) => {
    try {
        const [githubRepos, localState] = await Promise.all([
            listRepos(),
            readJSON('repos.json') || {},
        ]);

        const merged = githubRepos.map((repo) => {
            const local = localState[repo.name] || {};
            return {
                ...repo,
                enabled: local.enabled || false,
                cloneStatus: local.cloneStatus || null,
                enabledAt: local.enabledAt || null,
            };
        });

        res.json(merged);
    } catch (err) {
        console.error('GET /api/repos error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/repos/:name/enable
 * Clone repo to /workspace and mark as enabled.
 */
router.post('/:name/enable', async (req, res) => {
    const { name } = req.params;

    try {
        const repos = (await readJSON('repos.json')) || {};

        // Already enabled and ready?
        if (repos[name]?.enabled && repos[name]?.cloneStatus === 'ready') {
            return res.json({ status: 'already_enabled' });
        }

        // Find the repo in GitHub to get clone URL
        const githubRepos = await listRepos();
        const repo = githubRepos.find((r) => r.name === name);
        if (!repo) {
            return res.status(404).json({ error: `Repo '${name}' not found on GitHub` });
        }

        // Mark as cloning
        repos[name] = {
            enabled: true,
            cloneStatus: 'cloning',
            githubMeta: {
                description: repo.description,
                defaultBranch: repo.defaultBranch,
                lastPushed: repo.lastPushed,
                private: repo.private,
            },
            enabledAt: new Date().toISOString(),
        };
        await writeJSON('repos.json', repos);

        // Respond immediately — clone in background
        res.json({ status: 'cloning' });

        // Clone (use SSH URL for private repos, HTTPS for public)
        const cloneUrl = repo.private ? repo.sshUrl : repo.cloneUrl;
        const targetPath = `/workspace/${name}`;

        try {
            if (existsSync(targetPath)) {
                execSync(`git fetch origin main && git reset --hard origin/main`, {
                    cwd: targetPath,
                    timeout: 60_000,
                    stdio: 'pipe',
                });
            } else {
                execSync(`git clone ${cloneUrl} ${targetPath}`, {
                    timeout: 120_000,
                    stdio: 'pipe',
                    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
                });
            }
            repos[name].cloneStatus = 'ready';
        } catch (cloneErr) {
            console.error(`Clone failed for ${name}:`, cloneErr.message);
            repos[name].cloneStatus = 'error';
        }

        await writeJSON('repos.json', repos);
    } catch (err) {
        console.error(`POST /api/repos/${name}/enable error:`, err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

/**
 * POST /api/repos/:name/disable
 * Remove from workspace and mark as disabled.
 */
router.post('/:name/disable', async (req, res) => {
    const { name } = req.params;

    try {
        const repos = (await readJSON('repos.json')) || {};

        // Remove from filesystem
        const targetPath = `/workspace/${name}`;
        try {
            execSync(`rm -rf ${targetPath}`, { stdio: 'pipe' });
        } catch (err) {
            console.error(`Failed to remove ${targetPath}:`, err.message);
        }

        // Update state
        if (repos[name]) {
            repos[name].enabled = false;
            repos[name].cloneStatus = null;
        }
        await writeJSON('repos.json', repos);

        res.json({ status: 'disabled' });
    } catch (err) {
        console.error(`POST /api/repos/${name}/disable error:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
