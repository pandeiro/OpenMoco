/**
 * Web Push dispatch + subscription management.
 */

import webpush from 'web-push';
import { readJSON, writeJSON } from './data.js';

// Configure VAPID
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_CONTACT || 'mailto:admin@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Store a new push subscription.
 */
export async function subscribe(subscription) {
    const subs = (await readJSON('push_subscriptions.json')) || [];

    // Avoid duplicates by endpoint
    const exists = subs.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
        subs.push({
            ...subscription,
            subscribedAt: new Date().toISOString(),
        });
        await writeJSON('push_subscriptions.json', subs);
    }
}

/**
 * Dispatch a push notification to all stored subscriptions.
 * Automatically removes stale subscriptions (410 responses).
 *
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} [data] - Additional data payload (e.g., { url, failureId })
 */
export async function dispatch(title, body, data = {}) {
    const subs = (await readJSON('push_subscriptions.json')) || [];
    if (subs.length === 0) return;

    const payload = JSON.stringify({ title, body, data });
    const staleIndices = [];

    await Promise.allSettled(
        subs.map(async (sub, index) => {
            try {
                await webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: sub.keys },
                    payload
                );
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    staleIndices.push(index);
                } else {
                    console.error(`Push to ${sub.endpoint} failed:`, err.message);
                }
            }
        })
    );

    // Remove stale subscriptions
    if (staleIndices.length > 0) {
        const cleaned = subs.filter((_, i) => !staleIndices.includes(i));
        await writeJSON('push_subscriptions.json', cleaned);
        console.log(`Removed ${staleIndices.length} stale push subscription(s)`);
    }
}

/**
 * Get the VAPID public key for client-side subscription.
 */
export function getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || null;
}
