/**
 * SSE endpoint (stub for future use).
 * GET /events — Server-Sent Events stream.
 */

import { Router } from 'express';

const router = Router();

// Connected SSE clients
const clients = new Set();

router.get('/', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });

    res.write('data: {"type":"connected"}\n\n');

    clients.add(res);
    req.on('close', () => clients.delete(res));
});

/**
 * Broadcast an event to all connected SSE clients.
 */
export function broadcast(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
        client.write(message);
    }
}

export default router;
