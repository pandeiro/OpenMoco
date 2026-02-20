/**
 * Push subscription route.
 * POST /api/subscribe — store Web Push subscription
 * GET  /api/vapid-public-key — return VAPID public key
 */

import { Router } from 'express';
import { subscribe, getVapidPublicKey } from '../lib/push.js';

const router = Router();

/**
 * POST /api/subscribe
 * Body: { endpoint, keys: { p256dh, auth } }
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        await subscribe({ endpoint, keys });
        res.json({ status: 'subscribed' });
    } catch (err) {
        console.error('POST /api/subscribe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/vapid-public-key
 * Returns the VAPID public key for client-side subscription.
 */
router.get('/vapid-public-key', (_req, res) => {
    const key = getVapidPublicKey();
    if (!key) {
        return res.status(503).json({ error: 'VAPID not configured' });
    }
    res.json({ key });
});

export default router;
