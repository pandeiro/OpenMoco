/**
 * Web Push subscription helpers.
 */

/**
 * Update the push subscription for the current user.
 * @returns {Promise<boolean>} Success status
 */
export async function updateSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // 1. Get VAPID public key from events service
        const keyRes = await fetch('/api/vapid-public-key');
        if (!keyRes.ok) throw new Error('Failed to fetch VAPID key');
        const { key } = await keyRes.json();

        // 2. Subscribe
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key)
        });

        // 3. Send to events service
        const subscribeRes = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        return subscribeRes.ok;
    } catch (err) {
        console.error('Push subscription failed:', err);
        return false;
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
