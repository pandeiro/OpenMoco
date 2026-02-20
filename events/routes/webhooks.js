/**
 * GitHub webhook route.
 * POST /webhooks/github — validate + dispatch.
 * 
 * NOTE: This route needs raw body for HMAC validation.
 * The raw body middleware is applied in server.js before this router.
 */

import { Router } from 'express';
import { validateSignature, handleWebhookEvent } from '../lib/webhooks.js';

const router = Router();

/**
 * POST /webhooks/github
 * GitHub sends webhooks here. We validate the HMAC signature and dispatch.
 */
router.post('/github', async (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const rawBody = req.rawBody;

    if (!rawBody) {
        return res.status(400).json({ error: 'Missing request body' });
    }

    // Validate signature
    if (!validateSignature(rawBody, signature)) {
        console.warn('Webhook signature validation failed');
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse and handle
    try {
        const data = JSON.parse(rawBody.toString());
        console.log(`Webhook received: ${event} [${data.action || 'n/a'}]`);

        // Handle async — don't block the response
        handleWebhookEvent(event, data).catch((err) => {
            console.error(`Webhook handler error (${event}):`, err.message);
        });

        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook parse error:', err.message);
        res.status(400).json({ error: 'Invalid JSON payload' });
    }
});

export default router;
