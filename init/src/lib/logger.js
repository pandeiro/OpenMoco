/**
 * Frontend console log exporter.
 * Overrides console methods to forward logs to the server for Docker capture.
 */

const LOG_ENDPOINT = '/init/api/logs';

function generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const sessionId = generateSessionId();

const originalConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};

function serializeArgs(args) {
    return args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
        try {
            return JSON.stringify(arg);
        } catch {
            return String(arg);
        }
    }).join(' ');
}

function sendLog(level, ...args) {
    const payload = {
        source: 'frontend',
        sessionId,
        level,
        message: serializeArgs(args),
        timestamp: new Date().toISOString(),
    };

    const json = JSON.stringify(payload);

    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([json], { type: 'application/json' });
            navigator.sendBeacon(LOG_ENDPOINT, blob);
        } else {
            fetch(LOG_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: json,
                keepalive: true,
            }).catch(() => {});
        }
    } catch {
        // Silently fail
    }
}

export function initLogger() {
    console.log = (...args) => {
        originalConsole.log(...args);
        sendLog('log', ...args);
    };

    console.warn = (...args) => {
        originalConsole.warn(...args);
        sendLog('warn', ...args);
    };

    console.error = (...args) => {
        originalConsole.error(...args);
        sendLog('error', ...args);
    };

    console.log('[logger] Frontend log exporter initialized, sessionId:', sessionId);
}
