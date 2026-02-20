/**
 * Failures route.
 * GET /api/failures/:id — fetch a failure record
 */

import { Router } from 'express';
import { readJSON, writeJSON } from '../lib/data.js';

const router = Router();

/**
 * GET /api/failures/:id
 * Returns the failure record.
 */
router.get('/:id', async (req, res) => {
    try {
        const failure = await readJSON(`failures/${req.params.id}.json`);
        if (!failure) {
            return res.status(404).json({ error: 'Failure record not found' });
        }
        res.json(failure);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/failures/:id/consume
 * Mark a failure as consumed (sent to agent).
 */
router.post('/:id/consume', async (req, res) => {
    try {
        const failure = await readJSON(`failures/${req.params.id}.json`);
        if (!failure) {
            return res.status(404).json({ error: 'Failure record not found' });
        }
        failure.consumed = true;
        await writeJSON(`failures/${req.params.id}.json`, failure);
        res.json({ status: 'consumed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
