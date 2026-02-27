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
    console.log('[repos] GET /api/repos - starting fetch');
    try {
        console.log('[repos] Fetching GitHub repos and local state...');
        const [githubRepos, localState] = await Promise.all([
            listRepos(),
            readJSON('repos.json') || {},
        ]);
        console.log('[repos] GitHub repos fetched:', githubRepos.length);

        const CODE_DIR = process.env.CODE_DIR || '/code';
        const merged = githubRepos.map((repo) => {
            const local = localState[repo.name] || {};
            const targetPath = `${CODE_DIR}/${repo.name}`;
            
            // Verify filesystem state matches JSON state
            let cloneStatus = local.cloneStatus || null;
            if (local.enabled && cloneStatus === 'ready' && !existsSync(targetPath)) {
                console.log(`[repos] WARNING: ${repo.name} marked as ready but path doesn't exist: ${targetPath}`);
                cloneStatus = 'error';
            }
            
            return {
                ...repo,
                enabled: local.enabled || false,
                cloneStatus: cloneStatus,
                enabledAt: local.enabledAt || null,
            };
        });

        res.json(merged);
    } catch (err) {
        console.error('[repos] GET /api/repos ERROR:', err.message);
        console.error('[repos] Error stack:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/repos/:name/enable
 * Clone repo to /workspace and mark as enabled.
 */
router.post('/:name/enable', async (req, res) => {
    const { name } = req.params;
    console.log(`[repos] ===========================================`);
    console.log(`[repos] POST /api/repos/${name}/enable - REQUEST RECEIVED`);
    console.log(`[repos] CODE_DIR: ${process.env.CODE_DIR || '/code'}`);

    try {
        console.log(`[repos] [STEP 1] Entering try block for ${name}`);
        console.log(`[repos] [STEP 2] About to read repos.json`);
        const repos = (await readJSON('repos.json')) || {};
        console.log(`[repos] [STEP 3] Read repos.json, got ${Object.keys(repos).length} repos`);
        
        console.log(`[repos] [STEP 4] Checking if ${name} is already enabled and ready`);
        console.log(`[repos] [STEP 4a] repos[${name}]:`, repos[name]);
        console.log(`[repos] [STEP 4b] repos[${name}]?.enabled:`, repos[name]?.enabled);
        console.log(`[repos] [STEP 4c] repos[${name}]?.cloneStatus:`, repos[name]?.cloneStatus);
        
        // Check if already enabled and ready - BUT verify directory exists
        const CODE_DIR = process.env.CODE_DIR || '/code';
        const targetPath = `${CODE_DIR}/${name}`;
        const isActuallyReady = repos[name]?.enabled && 
                                repos[name]?.cloneStatus === 'ready' && 
                                existsSync(targetPath);
        
        console.log(`[repos] [STEP 4d] Checking if actually ready:`);
        console.log(`[repos] [STEP 4e]   enabled: ${repos[name]?.enabled}`);
        console.log(`[repos] [STEP 4f]   cloneStatus: ${repos[name]?.cloneStatus}`);
        console.log(`[repos] [STEP 4g]   path exists: ${existsSync(targetPath)}`);
        console.log(`[repos] [STEP 4h]   isActuallyReady: ${isActuallyReady}`);
        
        if (isActuallyReady) {
            console.log(`[repos] [STEP 4i] Repo ${name} already enabled and ready, returning`);
            return res.json({ status: 'already_enabled' });
        }
        
        if (repos[name]?.enabled && repos[name]?.cloneStatus === 'ready' && !existsSync(targetPath)) {
            console.log(`[repos] [STEP 4j] Repo ${name} marked ready but path missing - will re-clone`);
        }
        
        console.log(`[repos] [STEP 5] Proceeding with clone/setup...`);

        // Find the repo in GitHub to get clone URL
        console.log(`[repos] [STEP 6] About to list GitHub repos`);
        const githubRepos = await listRepos();
        console.log(`[repos] [STEP 7] Got ${githubRepos.length} GitHub repos`);
        
        console.log(`[repos] [STEP 8] Looking for ${name} in GitHub repos`);
        const repo = githubRepos.find((r) => r.name === name);
        console.log(`[repos] [STEP 9] Found repo:`, repo ? repo.fullName : 'NOT FOUND');
        
        if (!repo) {
            console.log(`[repos] [STEP 9a] Repo ${name} not found on GitHub!`);
            return res.status(404).json({ error: `Repo '${name}' not found on GitHub` });
        }
        console.log(`[repos] [STEP 10] Repo found, proceeding to mark as cloning`);

        // Mark as cloning
        console.log(`[repos] [STEP 11] Setting repos[${name}] to cloning state`);
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
        console.log(`[repos] [STEP 12] About to write repos.json with cloning status`);
        await writeJSON('repos.json', repos);
        console.log(`[repos] [STEP 13] Wrote repos.json successfully`);

        // Respond immediately — clone in background
        console.log(`[repos] [STEP 14] Sending response: { status: 'cloning' }`);
        res.json({ status: 'cloning' });
        console.log(`[repos] [STEP 15] Response sent`);

        // Clone (use SSH URL for private repos, HTTPS for public)
        console.log(`[repos] [STEP 16] Starting background clone process`);
        const cloneUrl = repo.private ? repo.sshUrl : repo.cloneUrl;
        // targetPath already defined above

        console.log(`[repos] [STEP 17] cloneUrl: ${cloneUrl}`);
        console.log(`[repos] [STEP 18] targetPath: ${targetPath}`);

        try {
            console.log(`[repos] [STEP 19] Checking if path exists: ${targetPath}`);
            const pathExists = existsSync(targetPath);
            console.log(`[repos] [STEP 20] Path exists: ${pathExists}`);
            
            if (pathExists) {
                const defaultBranch = repos[name].githubMeta?.defaultBranch || 'main';
                console.log(`[repos] [STEP 21] Path exists, doing git fetch (branch: ${defaultBranch})`);
                const result = execSync(`git fetch origin ${defaultBranch} && git reset --hard origin/${defaultBranch}`, {
                    cwd: targetPath,
                    timeout: 60_000,
                    stdio: 'pipe',
                });
                console.log(`[repos] [STEP 22] Fetch successful`);
            } else {
                console.log(`[repos] [STEP 23] Path doesn't exist, CLONING NOW`);
                console.log(`[repos] [STEP 24] Executing: git clone ${cloneUrl} ${targetPath}`);
                const result = execSync(`git clone ${cloneUrl} ${targetPath}`, {
                    timeout: 120_000,
                    stdio: 'pipe',
                    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
                });
                console.log(`[repos] [STEP 25] Clone command completed`);
                console.log(`[repos] [STEP 26] Result:`, result?.toString());
            }
            console.log(`[repos] [STEP 27] Setting cloneStatus to ready`);
            repos[name].cloneStatus = 'ready';
            console.log(`[repos] [STEP 28] Done!`);
        } catch (cloneErr) {
            console.error(`[repos] [STEP ERROR] CLONE FAILED:`);
            console.error(`[repos] [STEP ERROR] Message:`, cloneErr.message);
            console.error(`[repos] [STEP ERROR] stdout:`, cloneErr.stdout?.toString());
            console.error(`[repos] [STEP ERROR] stderr:`, cloneErr.stderr?.toString());
            console.error(`[repos] [STEP ERROR] code:`, cloneErr.status);
            console.error(`[repos] [STEP ERROR] signal:`, cloneErr.signal);
            repos[name].cloneStatus = 'error';
            console.log(`[repos] [STEP 29] Set cloneStatus to error`);
        }

        console.log(`[repos] [STEP 30] Writing final repos.json`);
        await writeJSON('repos.json', repos);
        console.log(`[repos] [STEP 31] COMPLETE for ${name}`);
        console.log(`[repos] ===========================================`);
    } catch (err) {
        console.error(`[repos] [FATAL ERROR] ${name}:`, err.message);
        console.error(`[repos] [FATAL ERROR] Stack:`, err.stack);
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
        const CODE_DIR = process.env.CODE_DIR || '/code';
        const targetPath = `${CODE_DIR}/${name}`;
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
