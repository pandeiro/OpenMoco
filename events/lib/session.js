/**
 * OpenCode SDK wrapper — session creation and prompting.
 * 
 * NOTE: The @opencode-ai/sdk package needs to be confirmed via the SDK spike.
 * This module stubs the interface and will be updated once the spike is complete.
 * For now it uses direct HTTP calls to the OpenCode API.
 */

import { readJSON, writeJSON } from './data.js';

const OPENCODE_BASE = process.env.OPENCODE_URL || 'http://opencode:8080';
const OPENCODE_PASSWORD = process.env.OPENCODE_SERVER_PASSWORD || '';

/**
 * Create a new OpenCode session and send the initial prompt.
 * 
 * @param {object} params
 * @param {string} params.projectPath - Absolute path to the project
 * @param {string} params.prompt - Reformulated prompt
 * @param {string} [params.branch] - Branch name to create
 * @param {string} [params.slug] - Branch slug
 * @param {string} [params.repo] - Repo name
 * @param {boolean} [params.notificationsEnabled] - Whether to send push notifications
 * @returns {{ sessionId: string, redirectUrl: string }}
 */
export async function createAndPrompt({
    projectPath,
    prompt,
    branch,
    slug,
    repo,
    notificationsEnabled = true,
}) {
    // Add branch instruction if applicable
    let fullPrompt = prompt;
    if (branch && slug) {
        fullPrompt = `First, create and switch to a new branch: git checkout -b ${slug}\n\nThen proceed with the task:\n\n${prompt}`;
    }

    // TODO: Replace with @opencode-ai/sdk once spike is complete
    // For now, use direct API calls to OpenCode

    // Create session
    const createRes = await fetch(`${OPENCODE_BASE}/api/session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENCODE_PASSWORD}`,
        },
        body: JSON.stringify({ projectPath }),
    });

    if (!createRes.ok) {
        const body = await createRes.text();
        throw new Error(`OpenCode session create failed (${createRes.status}): ${body}`);
    }

    const session = await createRes.json();
    const sessionId = session.id || session.sessionId;

    // Send prompt
    const promptRes = await fetch(`${OPENCODE_BASE}/api/session/${sessionId}/prompt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENCODE_PASSWORD}`,
        },
        body: JSON.stringify({
            text: fullPrompt,
            mode: 'plan',
        }),
    });

    if (!promptRes.ok) {
        const body = await promptRes.text();
        throw new Error(`OpenCode prompt failed (${promptRes.status}): ${body}`);
    }

    // Store active session
    await writeJSON('active_session.json', {
        sessionId,
        repo: repo || '',
        projectPath,
        branch: slug || null,
        createdAt: new Date().toISOString(),
        notificationsEnabled,
    });

    const redirectUrl = `/#/session/${sessionId}`;

    return { sessionId, redirectUrl };
}

/**
 * Send a follow-up prompt to the active session (for CI failure forwarding).
 */
export async function promptActiveSession(text) {
    const session = await readJSON('active_session.json');
    if (!session?.sessionId) {
        throw new Error('No active session');
    }

    const res = await fetch(`${OPENCODE_BASE}/api/session/${session.sessionId}/prompt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENCODE_PASSWORD}`,
        },
        body: JSON.stringify({
            text,
            mode: 'code',
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenCode prompt failed (${res.status}): ${body}`);
    }

    return { sessionId: session.sessionId, redirectUrl: `/#/session/${session.sessionId}` };
}
