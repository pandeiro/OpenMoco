import { readJSON, writeJSON } from './data.js';

const AGENT_BASE = process.env.AGENT_URL || 'http://agent:8080';

function extractTitle(prompt, maxLen = 50) {
    const firstLine = prompt.split('\n')[0];
    return firstLine.length > maxLen 
        ? firstLine.substring(0, maxLen - 3) + '...'
        : firstLine;
}

export async function createAndPrompt({
    projectPath,
    prompt,
    branch,
    slug,
    repo,
    notificationsEnabled = true,
}) {
    let fullPrompt = prompt;
    if (branch && slug) {
        fullPrompt = `First, create and switch to a new branch: git checkout -b ${slug}\n\nThen proceed with the task:\n\n${prompt}`;
    }

    const directory = projectPath;
    const title = extractTitle(prompt);

    const createRes = await fetch(`${AGENT_BASE}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });

    if (!createRes.ok) {
        const body = await createRes.text();
        throw new Error(`OpenCode session create failed (${createRes.status}): ${body}`);
    }

    const session = await createRes.json();
    const sessionId = session.id || session.sessionId;

    const promptRes = await fetch(`${AGENT_BASE}/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-opencode-directory': directory,
        },
        body: JSON.stringify({
            parts: [{ type: "text", text: fullPrompt }],
            agent: "plan",
        }),
    });

    if (!promptRes.ok) {
        const body = await promptRes.text();
        throw new Error(`OpenCode prompt failed (${promptRes.status}): ${body}`);
    }

    await writeJSON('active_session.json', {
        sessionId,
        repo: repo || '',
        projectPath: directory,
        branch: slug || null,
        createdAt: new Date().toISOString(),
        notificationsEnabled,
    });

    const redirectUrl = `/#/session/${sessionId}`;

    return { sessionId, redirectUrl };
}

export async function promptActiveSession(text) {
    const session = await readJSON('active_session.json');
    if (!session?.sessionId) {
        throw new Error('No active session');
    }

    const res = await fetch(`${AGENT_BASE}/session/${session.sessionId}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-opencode-directory': session.projectPath,
        },
        body: JSON.stringify({
            parts: [{ type: "text", text: text }],
            agent: "build",
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenCode prompt failed (${res.status}): ${body}`);
    }

    return { sessionId: session.sessionId, redirectUrl: `/#/session/${session.sessionId}` };
}
