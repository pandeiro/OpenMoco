/**
 * Push subscription route.
 * POST /api/subscribe — store Web Push subscription
 * GET  /api/vapid-public-key — return VAPID public key
 */

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { subscribe, getVapidPublicKey } from '../lib/push.js';

const router = Router();

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

/**
 * POST /api/subscribe
 * Body: { endpoint, keys: { p256dh, auth } }
 */
router.post('/subscribe',
    body('endpoint').isURL().withMessage('endpoint must be a valid URL'),
    body('keys.p256dh').isString().isLength({ min: 1 }).withMessage('keys.p256dh is required'),
    body('keys.auth').isString().isLength({ min: 1 }).withMessage('keys.auth is required'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const { endpoint, keys } = req.body;

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
